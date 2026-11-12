export const PRICE_IDS = ['price_1SmsqkIsqdbNeRDSszArcnnx','price_1SmsrjIsqdbNeRDShyC0mdgf'];
export function checkoutOptions({priceId,returnUrl,customerId,userId}){
 if(!PRICE_IDS.includes(priceId))throw new Error('Choose a supported subscription plan.');
 const url=new URL(returnUrl);
 if(url.protocol!=='https:'||!['peptidelog.net','www.peptidelog.net'].includes(url.hostname)||url.username||url.password)throw new Error('Invalid checkout return URL.');
 url.search='';url.hash='';
 return {customer:customerId,line_items:[{price:priceId,quantity:1}],mode:'subscription',allow_promotion_codes:true,success_url:`${url.href}?session_id={CHECKOUT_SESSION_ID}`,cancel_url:url.href,metadata:{user_id:userId}};
}
