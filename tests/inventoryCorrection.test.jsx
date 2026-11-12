import React from 'react';
import { it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Inventory from '../src/pages/Inventory';
const update=vi.hoisted(()=>vi.fn(async()=>({success:false,error:new Error('Save failed')})));
vi.mock('../src/hooks/useInventory',()=>({default:()=>({inventory:[{id:'vial',peptide_name:'Test',quantity_mg:5,remaining_mg:2}],loading:false,error:null,updateInventory:update,addInventory:vi.fn(),deleteInventory:vi.fn(),getLowStockItems:()=>[],getExpiringItems:()=>[],getTotalStock:()=>2})}));
vi.mock('../src/hooks/useInjections',()=>({useInjections:()=>({injections:[]})}));
it('keeps corrections open on failure and sends the explicit remaining amount',async()=>{
 render(<Inventory/>);fireEvent.click(screen.getByTitle('Edit Item'));fireEvent.change(screen.getByLabelText('Remaining stock (mg)'),{target:{value:'1.5'}});fireEvent.click(screen.getByRole('button',{name:'Update Item'}));
 await waitFor(()=>expect(screen.getByRole('alert')).toHaveTextContent('Save failed'));
 expect(screen.getByLabelText('Remaining stock (mg)')).toHaveValue(1.5);
 expect(update).toHaveBeenCalledWith('vial',expect.objectContaining({remaining_mg:1.5}));
});
