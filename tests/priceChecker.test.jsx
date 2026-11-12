import React from 'react';
import { it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PriceChecker from '../src/components/PriceChecker';
const mocks=vi.hoisted(()=>({rpc:vi.fn(),read:vi.fn()}));
vi.mock('../src/lib/supabase',()=>({supabase:{rpc:mocks.rpc,from:()=>({select:()=>({eq:()=>({eq:mocks.read})})})}}));
vi.mock('../src/components/PriceAlerts',()=>({default:()=>null}));
beforeEach(()=>{mocks.rpc.mockReset();mocks.read.mockReset();});
it('labels stale quotes, shows actual mass costs, and reloads from the database',async()=>{
 mocks.rpc.mockResolvedValue({data:[{peptide_name:'Test',peptide_slug:'test'}],error:null});
 mocks.read.mockResolvedValue({data:[{id:'offer',price:50,quantity_mg:10,quantity_unit:'mg',last_verified_at:'2026-05-16',in_stock:true,product_url:'https://vendor.example/product',vendors:{name:'Example',is_active:true}}],error:null});
 render(<PriceChecker/>);await waitFor(()=>expect(screen.getByText(/These older records cannot establish/)).toBeInTheDocument());
 expect(screen.getByText('10 mg · $5.00 / mg')).toBeInTheDocument();expect(screen.getByRole('link',{name:/View recorded product page/})).toHaveAttribute('href','https://vendor.example/product');
 expect(screen.queryByText(/Lowest comparable recent quote:/)).not.toBeInTheDocument();
 fireEvent.click(screen.getByRole('button',{name:/Reload recorded prices/}));await waitFor(()=>expect(mocks.read).toHaveBeenCalledTimes(2));
});
it('shows failures without inventing fallback vendor prices',async()=>{
 mocks.rpc.mockResolvedValue({data:[{peptide_name:'Test',peptide_slug:'test'}],error:null});mocks.read.mockResolvedValue({data:null,error:new Error('offline')});
 render(<PriceChecker/>);await waitFor(()=>expect(screen.getByRole('alert')).toHaveTextContent('Recorded prices could not be loaded'));
 expect(screen.queryByRole('link',{name:/View recorded product page/})).not.toBeInTheDocument();
});
