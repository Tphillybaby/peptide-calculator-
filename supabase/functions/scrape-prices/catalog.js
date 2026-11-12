export const TARGET_PEPTIDES = [
    // GLP-1/Weight Loss
    { name: 'Semaglutide', slug: 'semaglutide', searchTerms: ['semaglutide', 'ozempic', 'wegovy', 'glp-1 s', 'glp-1s'] },
    { name: 'Tirzepatide', slug: 'tirzepatide', searchTerms: ['tirzepatide', 'mounjaro', 'glp-2 t', 'glp-2t'] },
    { name: 'Retatrutide', slug: 'retatrutide', searchTerms: ['retatrutide', 'glp-3 r', 'glp-3r'] },
    { name: 'Tesofensine', slug: 'tesofensine', searchTerms: ['tesofensine'] },
    { name: 'AOD-9604', slug: 'aod-9604', searchTerms: ['aod-9604', 'aod9604'] },
    { name: '5-Amino-1MQ', slug: '5-amino-1mq', searchTerms: ['5-amino-1mq', '5amino1mq', '5-amino 1mq'] },
    // Healing & Recovery
    { name: 'BPC-157', slug: 'bpc-157', searchTerms: ['bpc-157', 'bpc157', 'body protection compound'] },
    { name: 'BPC-157 Arginate', slug: 'bpc-157-arginate', searchTerms: ['bpc-157 arginate', 'bpc157 arginate', 'bpc 157 arginate', 'stable bpc'] },
    { name: 'TB-500', slug: 'tb-500', searchTerms: ['tb-500', 'tb500', 'thymosin beta'] },
    { name: 'KPV', slug: 'kpv', searchTerms: ['kpv', 'kpv tripeptide'] },
    { name: 'LL-37', slug: 'll-37', searchTerms: ['ll-37', 'll37', 'cathelicidin'] },
    // Growth Hormone / GHRPs
    { name: 'Ipamorelin', slug: 'ipamorelin', searchTerms: ['ipamorelin'] },
    { name: 'CJC-1295 (no DAC)', slug: 'cjc-1295-no-dac', searchTerms: ['cjc-1295 no dac', 'cjc1295 no dac', 'mod grf', 'cjc-1295 (no dac)'] },
    { name: 'CJC-1295 (DAC)', slug: 'cjc-1295-dac', searchTerms: ['cjc-1295 dac', 'cjc1295 dac', 'drug affinity complex'] },
    { name: 'GHRP-2', slug: 'ghrp-2', searchTerms: ['ghrp-2', 'ghrp2'] },
    { name: 'GHRP-6', slug: 'ghrp-6', searchTerms: ['ghrp-6', 'ghrp6'] },
    { name: 'Hexarelin', slug: 'hexarelin', searchTerms: ['hexarelin'] },
    { name: 'Sermorelin', slug: 'sermorelin', searchTerms: ['sermorelin'] },
    { name: 'Tesamorelin', slug: 'tesamorelin', searchTerms: ['tesamorelin', 'egrifta'] },
    { name: 'IGF-1 LR3', slug: 'igf-1-lr3', searchTerms: ['igf-1 lr3', 'igf1 lr3', 'long r3'] },
    { name: 'PEG-MGF', slug: 'peg-mgf', searchTerms: ['peg-mgf', 'pegmgf', 'pegylated mgf'] },
    { name: 'Follistatin 344', slug: 'follistatin-344', searchTerms: ['follistatin 344', 'follistatin-344', 'fs344'] },
    { name: 'Fragment 176-191', slug: 'fragment-176-191', searchTerms: ['fragment 176-191', 'hgh fragment', 'frag 176', 'frag-176'] },
    { name: 'MK-677', slug: 'mk-677', searchTerms: ['mk-677', 'mk677', 'ibutamoren'] },
    // Sexual Health / Tanning
    { name: 'PT-141', slug: 'pt-141', searchTerms: ['pt-141', 'pt141', 'bremelanotide'] },
    { name: 'Melanotan II', slug: 'melanotan-ii', searchTerms: ['melanotan ii', 'melanotan 2', 'mt2', 'mt 2', 'mt-2'] },
    { name: 'Kisspeptin-10', slug: 'kisspeptin-10', searchTerms: ['kisspeptin', 'kiss-10', 'kisspeptin-10'] },
    { name: 'Gonadorelin', slug: 'gonadorelin', searchTerms: ['gonadorelin', 'gnrh', 'gonado'] },
    { name: 'Oxytocin', slug: 'oxytocin', searchTerms: ['oxytocin'] },
    // Cognitive / Nootropic
    { name: 'Semax', slug: 'semax', searchTerms: ['semax'] },
    { name: 'Selank', slug: 'selank', searchTerms: ['selank'] },
    { name: 'Dihexa', slug: 'dihexa', searchTerms: ['dihexa'] },
    { name: 'DSIP', slug: 'dsip', searchTerms: ['dsip', 'delta sleep'] },
    { name: 'Cerebrolysin', slug: 'cerebrolysin', searchTerms: ['cerebrolysin'] },
    // Anti-aging / Mitochondrial
    { name: 'Epithalon', slug: 'epithalon', searchTerms: ['epithalon', 'epitalon'] },
    { name: 'MOTS-c', slug: 'mots-c', searchTerms: ['mots-c', 'motsc'] },
    { name: 'SS-31', slug: 'ss-31', searchTerms: ['ss-31', 'ss31', 'elamipretide'] },
    { name: 'Thymulin', slug: 'thymulin', searchTerms: ['thymulin'] },
    { name: 'NAD+', slug: 'nad-plus', searchTerms: ['nad+', 'nad plus', 'nicotinamide adenine'] },
    // Skin / Hair
    { name: 'GHK-Cu', slug: 'ghk-cu', searchTerms: ['ghk-cu', 'ghkcu', 'copper peptide'] },
    { name: 'SNAP-8', slug: 'snap-8', searchTerms: ['snap-8', 'snap8'] },
];

export function matchPeptide(name) {
 const normalized=name.toLowerCase().replace(/[^a-z0-9]/g,'');
 if(/blend|bundle|capsule|tablet|nasal|topical|cream|spray|pack|\bkit\b/i.test(name))return null;
 let matches=TARGET_PEPTIDES.filter(p=>p.searchTerms.some(t=>normalized.includes(t.replace(/[^a-z0-9]/g,''))));
 if(matches.some(p=>p.slug==='bpc-157-arginate'))matches=matches.filter(p=>p.slug!=='bpc-157');
 return matches.length===1?matches[0]:null;
}
export function productQuantity(name) {
 const matches=[...name.matchAll(/(\d+(?:\.\d+)?)\s*(mg|mcg|iu|ml)\b/gi)];
 if(matches.length!==1)return null;
 let value=Number(matches[0][1]),unit=matches[0][2].toLowerCase();
 if(unit==='mcg'){value/=1000;unit='mg';}
 return value>0&&value<=10000?{value,unit}:null;
}
export function listedPrice(element) {
 const selected=element.querySelector('ins')||element;
 const text=selected.textContent.replace(/,/g,'');
 const amounts=[...text.matchAll(/\$\s*(\d+(?:\.\d{1,2})?)/g)].map(m=>Number(m[1]));
 const unique=[...new Set(amounts)];
 return unique.length===1&&unique[0]>0?unique[0]:null;
}
export function vendorUrl(value,base) {
 if(typeof value!=='string'||!value.trim())return null;
 try {const u=new URL(value,base),b=new URL(base);if(u.protocol!=='https:'||u.username||u.password||u.search||u.hash||u.hostname.replace(/^www\./,'')!==b.hostname.replace(/^www\./,''))return null;return u.href;}catch{return null;}
}
export function parseCatalog(doc,base) {
 const quotes=[];
 for(const card of doc.querySelectorAll('li.product,.product-item,.product-small.box,.product-grid-item')){
  const name=card.querySelector('.woocommerce-loop-product__title,.product-item-name,.product-title,.card-title')?.textContent.trim();
  if(!name)continue;
  const peptide=matchPeptide(name),quantity=productQuantity(name),priceElement=card.querySelector('.price,.money');
  const price=priceElement?listedPrice(priceElement):null;
  const url=vendorUrl(card.querySelector('a[href]')?.getAttribute('href'),base);
  if(!peptide||!quantity||quantity.unit!=='mg'||!price||!url)continue;
  const unavailable=card.matches('.outofstock,.out-of-stock')||!!card.querySelector('.out-of-stock,.soldout,.sold-out')||/out of stock|sold out/i.test(card.textContent);
  quotes.push({peptide_name:peptide.name,peptide_slug:peptide.slug,price,quantity_mg:quantity.value,quantity_unit:quantity.unit,price_per_mg:quantity.unit==='mg'?price/quantity.value:null,original_product_name:name,product_url:url,in_stock:!unavailable});
 }
 const unique=new Map();
 for(const q of quotes){const old=unique.get(q.peptide_slug);if(!old||(q.in_stock&&!old.in_stock)||(q.in_stock===old.in_stock&&q.quantity_unit===old.quantity_unit&&(q.price_per_mg??q.price)<(old.price_per_mg??old.price)))unique.set(q.peptide_slug,q);}
 return [...unique.values()];
}
