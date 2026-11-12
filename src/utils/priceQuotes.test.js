import { it, expect } from 'vitest';
import { normalizeQuote, quoteMassMg, sortQuotes, lowestComparableQuote, safePriceUrl } from './priceQuotes';
const now = new Date('2026-11-12T12:00:00Z');
const row={id:'a',price:50,quantity_mg:10,quantity_unit:'mg',last_verified_at:'2026-11-11T12:00:00Z',in_stock:true,product_url:'https://vendor.example/product',vendors:{name:'Example',website_url:'https://vendor.example',is_active:true}};
it('calculates comparable prices from mass rather than trusting a stored price-per-mg value',()=>{
 expect(normalizeQuote({...row,price_per_mg:0.01},now).perMg).toBe(5);expect(quoteMassMg({quantity_mg:500,quantity_unit:'mcg'})).toBe(.5);expect(quoteMassMg({quantity_mg:10,quantity_unit:'iu'})).toBeNull();expect(quoteMassMg({quantity_mg:10,quantity_unit:'ml'})).toBeNull();
});
it('does not turn old, future, or undated quotes into current best deals',()=>{
 const stale=normalizeQuote({...row,last_verified_at:'2026-05-16'},now);expect(stale.fresh).toBe(false);
 expect(lowestComparableQuote([stale])).toBeNull();expect(normalizeQuote({...row,last_verified_at:'2026-11-13'},now).verified).toBeNull();expect(normalizeQuote({...row,last_verified_at:null},now).fresh).toBe(false);
});
it('picks the lowest comparable in-stock quote independently of display sorting',()=>{
 const a=normalizeQuote(row,now), b=normalizeQuote({...row,id:'b',price:30,quantity_mg:2},now);
 expect(sortQuotes([a,b],'price')[0]).toBe(b);expect(lowestComparableQuote([b,a])).toBe(a);
 expect(lowestComparableQuote([{...a,in_stock:false},b])).toBe(b);
 expect(sortQuotes([a,b],'perMg',' EXAMPLE ',true)).toHaveLength(2);
});
it('rejects invalid prices and unsafe URLs while distinguishing vendor home pages',()=>{
 expect(normalizeQuote({...row,price:'invalid'},now)).toBeNull();expect(safePriceUrl('javascript:alert(1)')).toBeNull();
 expect(normalizeQuote({...row,product_url:null},now)).toMatchObject({url:'https://vendor.example/',productLink:false});
});
