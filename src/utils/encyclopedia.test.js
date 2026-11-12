import { expect, it } from 'vitest';
import { findPeptide, searchPeptides, uniquePeptides } from './encyclopedia';
import { peptideUrl } from './slugify';
const rows=[{name:'TB-500 (Thymosin Beta-4)',description:'Research',category:'Recovery',benefits:[]},{name:'CJC-1295 (DAC)'},{name:'CJC-1295 (no DAC)'}];
it('finds a unique short name but never selects a different CJC variant implicitly',()=>{
 expect(findPeptide(rows,'tb-500')).toBe(rows[0]);expect(findPeptide(rows,'cjc-1295')).toBeNull();expect(findPeptide(rows,'cjc-1295-no-dac')).toBe(rows[2]);expect(findPeptide(rows,'%')).toBeNull();
});
it('trims search whitespace, supports categories and does not mutate source order',()=>{
 expect(searchPeptides(rows,' Recovery ')).toEqual([rows[0]]);expect(searchPeptides(rows,'   ')).toEqual(rows);expect(rows[0].name).toBe('TB-500 (Thymosin Beta-4)');
});
it('routes popular links to real full names or explicit variant selection',()=>{
 expect(peptideUrl('TB-500')).toBe('/encyclopedia/tb-500-thymosin-beta-4');expect(peptideUrl('CJC-1295')).toBe('/encyclopedia?search=CJC-1295');expect(peptideUrl('GHK-Cu')).toBe('/encyclopedia/ghk-cu-copper-peptide');
});

it('keeps one stable record for case-only URL collisions without changing the database',()=>{
 const entries=[{id:'b',name:'FOXO4-DRI'},{id:'a',name:'Foxo4-DRI'},{id:'c',name:'BPC-157'}];
 expect(uniquePeptides(entries).map(x=>x.id)).toEqual(['a','c']);expect(entries).toHaveLength(3);
});
