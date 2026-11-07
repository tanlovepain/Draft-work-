import { merchant } from './merchant';

export const company = {
 name:'Ridgeline', descriptor:'ROOFING & EXTERIORS', city:'Austin', region:'Central Texas', phone:'(512) 555-0149', email:'hello@example.com',
 areas:['Austin','Round Rock','Cedar Park','Georgetown','Pflugerville','Leander'],
 services:[
 {id:'inspection',name:'Know your roof.',label:'Roof inspection',price:149,detail:'A thorough roof assessment, photos, and a clear written report. Know what needs attention before it becomes a bigger problem.',plan:merchant.plans.inspection},
 {id:'deposit',name:'Build with confidence.',label:'Project deposit',price:500,detail:'Reserve your project after approving a written estimate. Your deposit is credited toward the agreed project total.',plan:merchant.plans.deposit},
 {id:'repair',name:'Small fix. Big relief.',label:'Gutter clean & roof check',price:249,detail:'One-story homes up to 2,000 sq. ft. Includes gutter clearing and a visual roof check. Additional work requires a separate estimate.',plan:merchant.plans.service}
 ]
};
