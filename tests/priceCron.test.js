import {it,expect,vi,afterEach} from 'vitest';
import handler from '../api/cron/scrape-prices.js';
afterEach(()=>vi.unstubAllGlobals());
it('retires the Vercel route without contacting vendors or using database credentials',async()=>{const fetch=vi.fn();vi.stubGlobal('fetch',fetch);const response=await handler(new Request('https://peptidelog.net/api/cron/scrape-prices'));expect(response.status).toBe(410);expect(fetch).not.toHaveBeenCalled();expect((await response.json()).error).toContain('Supabase');});
