import { it, expect, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useInventory } from '../src/hooks/useInventory';
const insert=vi.hoisted(()=>vi.fn());
const auth=vi.hoisted(()=>({user:{id:'owner'}}));
vi.mock('../src/context/AuthContext',()=>({useAuth:()=>auth}));
vi.mock('../src/services/notificationService',()=>({notificationService:{sendLowStockAlert:vi.fn()}}));
vi.mock('../src/lib/supabase',()=>({supabase:{from:()=>({select:()=>({eq:()=>({order:async()=>({data:[],error:null})})}),insert})}}));
it('sends missing optional dates as null so an account can add a vial without an expiry',async()=>{
 insert.mockReturnValue({select:()=>({single:async()=>({data:{id:'vial',quantity_mg:5,remaining_mg:5},error:null})})});
 const {result}=renderHook(()=>useInventory({notifyLowStock:false}));await waitFor(()=>expect(result.current.loading).toBe(false));
 await act(async()=>{expect(await result.current.addInventory({peptide_name:'Test',quantity_mg:5,purchase_date:'2026-11-12',expiration_date:'',source:'',batch_number:''})).toEqual({success:true});});
 expect(insert).toHaveBeenCalledWith(expect.objectContaining({user_id:'owner',expiration_date:null,remaining_mg:5}));
});
