import {describe,it,expect} from 'vitest';
import {JSDOM} from 'jsdom';
import {matchPeptide,productQuantity,listedPrice,parseCatalog,vendorUrl} from '../supabase/functions/scrape-prices/catalog.js';
const doc=html=>new JSDOM(html).window.document;
describe('verified public catalog parsing',()=>{
 it('uses sale prices without merging original and sale digits',()=>{expect(listedPrice(doc('<span class="price"><del>$99.00</del><ins>$49.00</ins></span>').querySelector('span'))).toBe(49);});
 it('rejects ranges and ambiguous blend or package quantities',()=>{expect(listedPrice(doc('<span>$40 - $90</span>').querySelector('span'))).toBeNull();expect(matchPeptide('BPC-157 + TB-500 5mg/5mg')).toBeNull();expect(matchPeptide('BPC-157 5mg 10 pack')).toBeNull();expect(productQuantity('BPC 5mg + 10mg')).toBeNull();expect(productQuantity('BPC 5000mcg')).toEqual({value:5,unit:'mg'});});
 it('keeps distinct CJC variants and arginate distinct',()=>{expect(matchPeptide('BPC-157 Arginate 5mg').slug).toBe('bpc-157-arginate');expect(matchPeptide('CJC-1295 (no DAC) 5mg').slug).toBe('cjc-1295-no-dac');expect(matchPeptide('CJC-1295 5mg')).toBeNull();});
 it('only follows same-vendor public HTTPS links',()=>{expect(vendorUrl('https://coupons.example/product','https://vendor.example')).toBeNull();expect(vendorUrl(undefined,'https://vendor.example')).toBeNull();expect(vendorUrl('/p','https://vendor.example')).toBe('https://vendor.example/p');expect(vendorUrl('https://user:secret@vendor.example/p','https://vendor.example')).toBeNull();});
 it('reads current h3 markup and stock classes',()=>{const d=doc('<li class="product outofstock"><a href="/p"><h3 class="woocommerce-loop-product__title">BPC-157 – 5MG</h3><span class="price">$30.00</span></a></li>');expect(parseCatalog(d,'https://vendor.example')).toMatchObject([{peptide_slug:'bpc-157',price:30,quantity_mg:5,price_per_mg:6,in_stock:false}]);});
});
