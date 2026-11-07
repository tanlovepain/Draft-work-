const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store'}});
const clean=(value,max=100)=>typeof value==='string'?value.trim().slice(0,max):'';
export default {
 async fetch(request,env){
  const url=new URL(request.url);
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
  const visitorToken=request.headers.get('authorization')?.match(/^Bearer (\S+)$/)?.[1];
  if(!visitorToken)return json({error:'Sign in with Whop before requesting an estimate'},401);
  const apiOrigin=env.WHOP_API_ORIGIN||(sandbox?'https://sandbox-api.whop.com':'https://api.whop.com');
  let visitor;
  try{const identity=await fetch(`${apiOrigin}/api/v1/users/me`,{headers:{authorization:`Bearer ${visitorToken}`,'x-whop-inject-key':'none','api-version-date':'2026-11-05-1'}});if(!identity.ok)return json({error:'Whop sign-in expired. Please sign in again.'},401);visitor=await identity.json()}catch{return json({error:'Could not verify Whop sign-in'},502)}
  if(!/^user_[A-Za-z0-9]+$/.test(visitor.id||''))return json({error:'Could not verify Whop sign-in'},502);
  const payload={company_id:companyId,user_id:visitor.id,referrer:url.origin,metadata:{name,email,phone,zip,service,message,source:'roofing_website'}};
  const headers={'content-type':'application/json','api-version-date':'2026-11-05-1'};
  const apiKey=sandbox?env.WHOP_SANDBOX_API_KEY:env.WHOP_API_KEY;
  if(apiKey)headers.authorization=`Bearer ${apiKey}`;
  else if(sandbox||!env.APP_ID)return json({error:'Estimate service is not configured'},503);
  let response;try{response=await fetch(`${apiOrigin}/api/v1/leads`,{method:'POST',headers,body:JSON.stringify(payload)})}catch{return json({error:'Estimate service is temporarily unavailable'},502)}
  if(!response.ok)return json({error:'Estimate service is temporarily unavailable'},502);
  let lead;try{lead=await response.json()}catch{return json({error:'Could not confirm estimate request'},502)}
  if(!/^lead_/.test(lead.id||''))return json({error:'Could not confirm estimate request'},502);
  return json({leadId:lead.id,service});
 }
};
