// Staff-only demo tool. Run after verifying the job is complete and its total approved.
// Defaults to a dry run. --create writes a draft invoice; --send also emails it.
const [paymentId, setupId, totalText, action] = process.argv.slice(2);
const sandbox = process.env.WHOP_ENVIRONMENT !== 'production';
const key = sandbox ? process.env.WHOP_SANDBOX_API_KEY : process.env.WHOP_API_KEY;
const accountId = sandbox ? 'biz_QuP6gQdX9pBwCo' : 'biz_NjnUTht6pZas2V';
const depositPlan = sandbox ? 'plan_YWhBgfNmWRY01' : 'plan_dCOI1yr7dhmFy';
const origin = sandbox ? 'https://sandbox-api.whop.com/api/v1' : 'https://api.whop.com/api/v1';
if (!/^pay_[A-Za-z0-9]+$/.test(paymentId||'') || !/^sint_[A-Za-z0-9]+$/.test(setupId||'') || !key) throw Error('Provide a payment ID, setup intent ID, approved total, and matching server API key.');
const cents = Math.round(Number(totalText)*100);
if (!Number.isSafeInteger(cents) || cents<=50000) throw Error('Approved total must exceed the $500 deposit.');
const headers={authorization:`Bearer ${key}`,'content-type':'application/json','api-version-date':'2026-11-05-1'};
async function api(path,options={}){
 const response=await fetch(origin+path,{...options,headers:{...headers,...options.headers}});
 const body=await response.json();
 if(!response.ok)throw Error(`Whop ${response.status}: ${body.error?.message||'request failed'}`);
 return body;
}
const payment=await api(`/payments/${paymentId}`);
const setup=await api(`/setup_intents/${setupId}`);
if(payment.status!=='paid'||payment.variant_id!==depositPlan||!/^mber_/.test(payment.member_id||''))throw Error('Deposit is not a verified, paid $500 plan for a known member.');
if(setup.status!=='succeeded'||!/^payt_/.test(setup.payment_method_id||'')||payment.user?.id!==setup.user?.id)throw Error('Saved method is not verified for the deposit customer.');
const balance=(cents-50000)/100;
console.log(JSON.stringify({environment:sandbox?'sandbox':'production',paymentId,setupId,approvedTotal:Number(totalText),depositCredit:500,finalBalance:balance,mode:action||'dry-run'}));
if(action!=='--create'&&action!=='--send')process.exit(0);
const invoice=await api('/invoices',{method:'POST',headers:{'idempotency-key':`ridgeline-final-${paymentId}`},body:JSON.stringify({account_id:accountId,member_id:payment.member_id,items:[{variant:{billing_type:'one_time',currency:'usd',initial_price:balance,title:'Approved roofing project final balance'},quantity:1}],memo:`Approved project total $${Number(totalText).toFixed(2)} less verified $500.00 deposit (${paymentId}).`,metadata:{deposit_payment_id:paymentId,setup_intent_id:setupId}})});
console.log('Draft invoice:',invoice.id);
if(action==='--send'){
 const sent=await api(`/invoices/${invoice.id}/send`,{method:'POST',headers:{'idempotency-key':`ridgeline-final-send-${paymentId}`},body:'{}'});
 console.log('Sent invoice:',sent.id||invoice.id,sent.status);
}
