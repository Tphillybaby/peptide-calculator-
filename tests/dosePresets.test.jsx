import { it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useDosePresets } from '../src/hooks/useDosePresets';
const auth=vi.hoisted(()=>({user:null,authReady:true}));
const from=vi.hoisted(()=>vi.fn());
vi.mock('../src/context/AuthContext',()=>({useAuth:()=>auth}));
vi.mock('../src/lib/supabase',()=>({supabase:{from}}));
beforeEach(()=>{localStorage.clear();auth.user=null;auth.authReady=true;from.mockReset();});
it('saves reusable guest dose details without storing old notes/site/time',async()=>{
 const {result,unmount}=renderHook(()=>useDosePresets());await waitFor(()=>expect(result.current.loading).toBe(false));
 await act(async()=>{expect(await result.current.save('Morning',{peptide:'A',dosage:1,unit:'mg',notes:'old',site:'Arm',date:'old'})).toBe(true);});
 expect(result.current.presets[0]).toMatchObject({name:'Morning',peptide:'A',dosage:1,unit:'mg'});
 expect(result.current.presets[0]).not.toHaveProperty('notes');unmount();
 const next=renderHook(()=>useDosePresets());await waitFor(()=>expect(next.result.current.presets).toHaveLength(1));
});
it('does not mix guest presets into a signed-in account on a server failure',async()=>{
 localStorage.setItem('peptidelog_guest_dose_presets',JSON.stringify([{name:'Guest private'}]));
 auth.user={id:'owner'};from.mockReturnValue({select:()=>({eq:()=>({order:async()=>({data:null,error:new Error('offline')})})})});
 const {result}=renderHook(()=>useDosePresets());await waitFor(()=>expect(result.current.loading).toBe(false));
 expect(result.current.presets).toEqual([]);expect(result.current.error).toContain('Could not load');
});
