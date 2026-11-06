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
  if(body.website)return json({error:'Invalid request'},400);
  const name=clean(body.name),email=clean(body.email,254),phone=clean(body.phone,40),zip=clean(body.zip,5),service=clean(body.service),message=clean(body.message,3000);
  if(!name||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||!phone||!/^\d{5}$/.test(zip)||!['Roof repair','Roof replacement','Roof inspection'].includes(service)||body.consent!==true)return json({error:'Please complete the required fields'},400);
  if(!/^biz_[A-Za-z0-9]+$/.test(env.WHOP_ACCOUNT_ID||''))return json({error:'Estimate service is not configured'},503);
  const payload={account_id:env.WHOP_ACCOUNT_ID,referrer:url.origin,metadata:{name,email,phone,zip,service,message,source:'roofing_website'}};
  let response;try{response=await fetch(`${env.WHOP_API_ORIGIN||'https://api.whop.com'}/api/v1/leads`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(payload)})}catch{return json({error:'Estimate service is temporarily unavailable'},502)}
  if(!response.ok)return json({error:'Estimate service is temporarily unavailable'},502);
  const lead=await response.json();
  if(!/^lead_/.test(lead.id||''))return json({error:'Could not confirm estimate request'},502);
  return json({leadId:lead.id,service});
 }
};
