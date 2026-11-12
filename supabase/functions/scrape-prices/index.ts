import {createClient} from 'https://esm.sh/@supabase/supabase-js@2';
import {DOMParser} from 'https://deno.land/x/deno_dom@v0.1.38/deno-dom-wasm.ts';
import {parseCatalog,vendorUrl} from './catalog.js';
const agent='PeptideLogPriceChecker/1.0 (+https://peptidelog.net/contact)';
// Only public, same-vendor HTML. No proxy services, browser impersonation or challenge bypass.
async function publicPage(url:string,base:string){
 let next=vendorUrl(url,base);if(!next)throw new Error('Catalog must be a public same-vendor HTTPS URL');
 for(let i=0;i<4;i++){
  const response=await fetch(next,{headers:{'User-Agent':agent,Accept:'text/html'},redirect:'manual',signal:AbortSignal.timeout(12000)});
  if(response.status>=300&&response.status<400){next=vendorUrl(response.headers.get('location'),next);if(!next)throw new Error('Vendor redirected outside its public website');continue;}
  if(!response.ok)throw new Error(`Vendor returned HTTP ${response.status}`);
  if(Number(response.headers.get('content-length'))>5000000)throw new Error('Catalog exceeds size limit');
  const html=await response.text();if(html.length>5000000)throw new Error('Catalog exceeds size limit');
  if(/cf-chl-|challenge-form|verify you are human/i.test(html)&&!html.includes('woocommerce-loop-product__title'))throw new Error('Vendor access challenge; automated collection stopped');
  return {html,url:next};
 }
 throw new Error('Too many vendor redirects');
}
Deno.serve(async(req:Request)=>{
 const origin=req.headers.get('origin');const headers={'Content-Type':'application/json','Cache-Control':'no-store','Access-Control-Allow-Origin':origin==='https://www.peptidelog.net'?origin:'https://peptidelog.net','Access-Control-Allow-Headers':'authorization,apikey,content-type,x-client-info','Access-Control-Allow-Methods':'POST, OPTIONS'};
 const respond=(status:number,body:unknown)=>new Response(JSON.stringify(body),{status,headers});
 if(origin&&!['https://peptidelog.net','https://www.peptidelog.net'].includes(origin))return respond(403,{error:'Origin not allowed'});
 if(req.method==='OPTIONS')return respond(200,{ok:true});
 if(req.method!=='POST')return respond(405,{error:'Method not allowed'});
 const authorization=req.headers.get('authorization')||'';if(!authorization.startsWith('Bearer '))return respond(401,{error:'Unauthorized'});
 const db=createClient(Deno.env.get('SUPABASE_URL')!,Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,{auth:{persistSession:false}});
 try{
  const token=authorization.slice(7);
  const {data:scheduled}=await db.rpc('price_collector_authorized',{p_token:token});
  if(!scheduled){const {data:{user},error}=await db.auth.getUser(token);if(error||!user)return respond(401,{error:'Unauthorized'});const {data:profile}=await db.from('profiles').select('is_admin').eq('id',user.id).single();if(!profile?.is_admin)return respond(403,{error:'Administrator access required'});}
  const {vendor_slug}=await req.json();
  if(typeof vendor_slug!=='string'||!vendor_slug)return respond(400,{error:'Select one vendor per collection request'});
  const {data:vendor,error}=await db.from('vendors').select('id,name,slug,website_url,is_active,catalog_url:scrape_config->>searchUrl').eq('slug',vendor_slug).single();
  if(error||!vendor)return respond(404,{error:'Vendor not found'});
  if(!vendor.is_active)return respond(409,{error:'Vendor is inactive'});
  const start=Date.now();let found=0,updated=0;const errors:string[]=[];
  try{
   let url=vendor.slug==='core-peptides'?'https://www.corepeptides.com/peptides/':vendor.catalog_url||vendor.website_url;
   const seen=new Set<string>();const all=new Map();
   for(let page=0;page<3&&url;page++){
    if(seen.has(url))break;seen.add(url);
    const result=await publicPage(url,vendor.website_url);const doc=new DOMParser().parseFromString(result.html,'text/html');if(!doc)throw new Error('Invalid vendor catalog HTML');
    for(const quote of parseCatalog(doc,result.url)){if(!all.has(quote.peptide_slug))all.set(quote.peptide_slug,quote);}
    url=vendorUrl(doc.querySelector('a.next,a[rel="next"]')?.getAttribute('href'),result.url)||'';
   }
   found=all.size;if(!found)throw new Error('No unambiguous public USD vial prices found; catalog may require login or have changed');
   for(const quote of all.values()){
    const {data:row,error}=await db.from('peptide_prices').upsert({...quote,unit:'vial',quantity:`${quote.quantity_mg} mg`,original_price:null,vendor_id:vendor.id,last_verified_at:new Date().toISOString(),updated_at:new Date().toISOString()},{onConflict:'vendor_id,peptide_slug'}).select('id').single();
    if(error){errors.push('Database rejected a quote');continue;}updated++;
    const {error:historyError}=await db.from('price_history').insert({peptide_price_id:row.id,price:quote.price,quantity_mg:quote.quantity_mg});if(historyError)errors.push('Price history could not be saved');
   }
  }catch(error){errors.push((error as Error).message);}
  const status=errors.length?(updated?'partial':'failed'):'success';
  const {error:logError}=await db.from('scrape_logs').insert({vendor_id:vendor.id,status,products_found:found,products_updated:updated,error_message:[...new Set(errors)].join('; '),duration_ms:Date.now()-start});
  if(logError)return respond(500,{error:'Collection status could not be recorded'});
  if(updated)await db.from('vendors').update({last_scraped_at:new Date().toISOString()}).eq('id',vendor.id);
  return respond(updated?200:502,{success:status==='success',results:[{vendor:vendor.name,found,updated,errors:[...new Set(errors)]}]});
 }catch{ return respond(500,{error:'Price collection failed'}); }
});
