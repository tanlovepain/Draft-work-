const sandbox = import.meta.env.MODE === 'sandbox';
const clientId = sandbox ? 'app_b71pIdYBuLidRk' : 'app_yxpWkkwho77qrL';
const apiOrigin = sandbox ? 'https://sandbox-api.whop.com' : 'https://api.whop.com';
const tokenKey = 'ridgeline_whop_access_token';
const pendingKey = 'ridgeline_whop_oauth_pending';

const base64url = bytes => btoa(String.fromCharCode(...bytes)).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
const random = () => base64url(crypto.getRandomValues(new Uint8Array(32)));

export function getWhopToken(){return sessionStorage.getItem(tokenKey);}
export function clearWhopToken(){sessionStorage.removeItem(tokenKey);}

export async function beginWhopSignIn(){
  const verifier=random(),state=random(),nonce=random();
  const challenge=base64url(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(verifier))));
  sessionStorage.setItem(pendingKey,JSON.stringify({verifier,state,nonce,returnTo:location.hash||'#estimate',started:Date.now()}));
  const params=new URLSearchParams({response_type:'code',client_id:clientId,redirect_uri:`${location.origin}/`,scope:'openid profile email',state,nonce,code_challenge:challenge,code_challenge_method:'S256'});
  location.assign(`${apiOrigin}/oauth/authorize?${params}`);
}

export async function completeWhopSignIn(){
  const url=new URL(location.href);
  if(!url.searchParams.has('code')&&!url.searchParams.has('error'))return false;
  const pending=JSON.parse(sessionStorage.getItem(pendingKey)||'null');
  sessionStorage.removeItem(pendingKey);
  history.replaceState(null,'',`${url.pathname}${pending?.returnTo||'#estimate'}`);
  if(url.searchParams.has('error')){
    const code=(url.searchParams.get('error')||'unknown').replace(/[^a-z_]/gi,'').slice(0,40);
    throw Error(`Whop sign-in failed (${code}). Please try again.`);
  }
  if(!pending||Date.now()-pending.started>600000||url.searchParams.get('state')!==pending.state)throw Error('Whop sign-in expired. Please try again.');
  let response;
  try{response=await fetch('/api/oauth/token',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({code:url.searchParams.get('code'),code_verifier:pending.verifier})});}
  catch{throw Error('Whop sign-in failed: token request blocked by the browser.');}
  if(!response.ok){const detail=await response.json().catch(()=>({}));const code=(detail.error||`HTTP_${response.status}`).replace(/[^a-z_0-9]/gi,'').slice(0,40);throw Error(`Whop sign-in failed (${code}).`);}
  const tokens=await response.json();
  if(!tokens.access_token)throw Error('Whop sign-in did not return an access token.');
  sessionStorage.setItem(tokenKey,tokens.access_token);
  return true;
}
