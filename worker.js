const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store'}});
const clean=(value,max=100)=>typeof value==='string'?value.trim().slice(0,max):'';
export default {
 async fetch(request,env){
  const url=new URL(request.url);
  if(url.pathname==='/api/deposit-status')return depositStatus(request,env,url);
  if(url.pathname==='/api/oauth/token')return exchangeToken(request,env,url);
  if(url.pathname==='/api/admin/leads')return listLeads(request,env,url);
  if(url.pathname!=='/api/estimate')return env.ASSETS.fetch(request);
  if(request.method!=='POST')return json({error:'Method not allowed'},405);
  if(request.headers.get('origin')!==url.origin)return json({error:'Invalid origin'},403);
  if(Number(request.headers.get('content-length')||0)>8000)return json({error:'Request too large'},413);
  let body;try{body=await request.json()}catch{return json({error:'Invalid request'},400)}
  if(!body||typeof body!=='object'||Array.isArray(body)||body.website)return json({error:'Invalid request'},400);
  const name=clean(body.name),email=clean(body.email,254),phone=clean(body.phone,40),zip=clean(body.zip,5),service=clean(body.service),message=clean(body.message,3000);
  if(!name||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||!phone||!/^\d{5}$/.test(zip)||!['Roof repair','Roof replacement','Roof inspection'].includes(service)||body.consent!==true)return json({error:'Please complete the required fields'},400);
  const sandbox=env.WHOP_ENVIRONMENT==='sandbox';
  const companyId=env.WHOP_COMPANY_ID||env.WHOP_ACCOUNT_ID||(sandbox?'biz_QuP6gQdX9pBwCo':'biz_NjnUTht6pZas2V');
  if(!/^biz_[A-Za-z0-9]+$/.test(companyId||''))return json({error:'Estimate service is not configured'},503);
  const apiOrigin=env.WHOP_API_ORIGIN||(sandbox?'https://sandbox-api.whop.com':'https://api.whop.com');
  const headers={'content-type':'application/json','api-version-date':'2026-11-05-1'};
  const apiKey=sandbox?env.WHOP_SANDBOX_API_KEY:env.WHOP_API_KEY;
  if(apiKey)headers.authorization=`Bearer ${apiKey}`;
  else if(sandbox||!env.APP_ID)return json({error:'Estimate service is not configured'},503);
  const visitorToken=request.headers.get('authorization')?.match(/^Bearer (\S+)$/)?.[1];
  if(!visitorToken)return json({error:'Sign in with Whop before requesting an estimate'},401);
  let visitor;
  try{const identity=await fetch(`${apiOrigin}/api/v1/users/me`,{headers:{authorization:`Bearer ${visitorToken}`,'x-whop-inject-key':'none','api-version-date':'2026-11-05-1'}});if(!identity.ok)return json({error:'Whop sign-in expired. Please sign in again.'},401);visitor=await identity.json()}catch{return json({error:'Could not verify Whop sign-in'},502)}
  if(!/^user_[A-Za-z0-9]+$/.test(visitor.id||''))return json({error:'Could not verify Whop sign-in'},502);
  let company;try{const response=await fetch(`${apiOrigin}/api/v1/companies/${companyId}`,{headers});if(!response.ok)return json({error:'Could not verify merchant account'},502);company=await response.json()}catch{return json({error:'Could not verify merchant account'},502)}
  if(visitor.id===company.owner_user?.id)return json({error:'Use a separate customer Whop account to request an estimate. The merchant account cannot be its own Lead.'},403);
  const payload={company_id:companyId,user_id:visitor.id,referrer:url.origin,metadata:{name,email,phone,zip,service,message,source:'roofing_website'}};
  let response;try{response=await fetch(`${apiOrigin}/api/v1/leads`,{method:'POST',headers,body:JSON.stringify(payload)})}catch{return json({error:'Estimate service is temporarily unavailable'},502)}
  if(!response.ok)return json({error:'Estimate service is temporarily unavailable'},502);
  let lead;try{lead=await response.json()}catch{return json({error:'Could not confirm estimate request'},502)}
  if(!/^lead_/.test(lead.id||''))return json({error:'Could not confirm estimate request'},502);
  return json({leadId:lead.id,service});
 }
};

async function exchangeToken(request,env,url){
 if(request.method!=='POST')return json({error:'Method not allowed'},405);
 if(request.headers.get('origin')!==url.origin)return json({error:'Invalid origin'},403);
 let body;try{body=await request.json()}catch{return json({error:'Invalid request'},400)}
 const code=body?.code,verifier=body?.code_verifier;
 if(typeof code!=='string'||code.length<5||code.length>2048||typeof verifier!=='string'||!/^[A-Za-z0-9_-]{43,128}$/.test(verifier))return json({error:'Invalid request'},400);
 const sandbox=env.WHOP_ENVIRONMENT==='sandbox';
 const secret=env.WHOP_OAUTH_CLIENT_SECRET||(sandbox?env.WHOP_SANDBOX_API_KEY:env.WHOP_API_KEY);
 if(!secret)return json({error:'Whop sign-in is not configured'},503);
 const apiOrigin=env.WHOP_API_ORIGIN||(sandbox?'https://sandbox-api.whop.com':'https://api.whop.com');
 const clientId=sandbox?'app_b71pIdYBuLidRk':'app_yxpWkkwho77qrL';
 let response;
 try{response=await fetch(`${apiOrigin}/oauth/token`,{method:'POST',headers:{'content-type':'application/json','x-whop-inject-key':'none'},body:JSON.stringify({grant_type:'authorization_code',code,redirect_uri:`${url.origin}/`,client_id:clientId,client_secret:secret,code_verifier:verifier})})}catch{return json({error:'Whop sign-in is temporarily unavailable'},502)}
 const result=await response.json().catch(()=>({}));
 if(!response.ok)return json({error:result.error||'Whop sign-in failed'},response.status);
 if(!result.access_token)return json({error:'Whop sign-in did not return a token'},502);
 return json({access_token:result.access_token,expires_in:result.expires_in});
}

async function listLeads(request,env,url){
 if(request.method!=='GET')return json({error:'Method not allowed'},405);
 const token=request.headers.get('authorization')?.match(/^Bearer (\S+)$/)?.[1];
 if(!token)return json({error:'Sign in with Whop first'},401);
 const sandbox=env.WHOP_ENVIRONMENT==='sandbox';
 const accountId=env.WHOP_COMPANY_ID||env.WHOP_ACCOUNT_ID||(sandbox?'biz_QuP6gQdX9pBwCo':'biz_NjnUTht6pZas2V');
 const key=sandbox?env.WHOP_SANDBOX_API_KEY:env.WHOP_API_KEY;
 if(!key&&(sandbox||!env.APP_ID))return json({error:'Lead viewer is not configured'},503);
 const origin=env.WHOP_API_ORIGIN||(sandbox?'https://sandbox-api.whop.com':'https://api.whop.com');
 const headers={'api-version-date':'2026-11-05-1'};if(key)headers.authorization=`Bearer ${key}`;
 try{
  const [meResponse,companyResponse]=await Promise.all([
   fetch(`${origin}/api/v1/users/me`,{headers:{authorization:`Bearer ${token}`,'api-version-date':'2026-11-05-1','x-whop-inject-key':'none'}}),
   fetch(`${origin}/api/v1/companies/${accountId}`,{headers})
  ]);
  if(!meResponse.ok)return json({error:'Whop sign-in expired'},401);
  if(!companyResponse.ok)return json({error:'Could not verify account owner'},502);
  const [me,company]=await Promise.all([meResponse.json(),companyResponse.json()]);
  if(me.id!==company.owner_user?.id)return json({error:'Only the account owner can view Leads'},403);
  const response=await fetch(`${origin}/api/v1/leads?company_id=${encodeURIComponent(accountId)}&limit=50`,{headers});
  if(!response.ok)return json({error:'Could not load Leads'},502);
  const data=await response.json();
  return json({leads:(data.data||[]).filter(x=>x.metadata?.source==='roofing_website').map(x=>({id:x.id,legacy_owner_record:x.user?.id===me.id,created_at:x.created_at,name:x.metadata?.name,email:x.metadata?.email,phone:x.metadata?.phone,zip:x.metadata?.zip,service:x.metadata?.service,message:x.metadata?.message}))});
 }catch{return json({error:'Could not load Leads'},502)}
}

async function depositStatus(request,env,url){
 if(request.method!=='GET')return json({error:'Method not allowed'},405);
 const id=url.searchParams.get('payment_id');
 if(!/^pay_[A-Za-z0-9]+$/.test(id||''))return json({error:'Invalid payment reference'},400);
 const sandbox=env.WHOP_ENVIRONMENT==='sandbox';
 const origin=env.WHOP_API_ORIGIN||(sandbox?'https://sandbox-api.whop.com':'https://api.whop.com');
 const key=sandbox?env.WHOP_SANDBOX_API_KEY:env.WHOP_API_KEY;
 if(!key&&(sandbox||!env.APP_ID))return json({error:'Payment verification is not configured'},503);
 const headers={'api-version-date':'2026-11-05-1'};if(key)headers.authorization=`Bearer ${key}`;
 try{
  const response=await fetch(`${origin}/api/v1/payments/${id}`,{headers});
  if(!response.ok)return json({error:'Could not verify payment'},502);
  const payment=await response.json();
  const expectedAccount=env.WHOP_COMPANY_ID||env.WHOP_ACCOUNT_ID||(sandbox?'biz_QuP6gQdX9pBwCo':'biz_NjnUTht6pZas2V');
  const expectedPlan=sandbox?'plan_YWhBgfNmWRY01':'plan_dCOI1yr7dhmFy';
  const paid=payment.status==='paid'&&payment.variant_id===expectedPlan&&(!payment.account_id||payment.account_id===expectedAccount);
  return json({paid});
 }catch{return json({error:'Could not verify payment'},502)}
}
