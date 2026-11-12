import { it, expect, vi, afterEach } from 'vitest';
import handler from '../api/cron/scrape-prices';
afterEach(()=>{vi.unstubAllEnvs();vi.unstubAllGlobals();});
it('rejects a cron request when authentication is not configured',async()=>{
 vi.stubEnv('CRON_SECRET','');const response=await handler(new Request('https://site.example/api/cron/scrape-prices'));expect(response.status).toBe(401);
});
it('reports upstream scraper failures as failures',async()=>{
 vi.stubEnv('CRON_SECRET','test');vi.stubEnv('VITE_SUPABASE_URL','https://database.example');vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY','test');vi.stubGlobal('fetch',vi.fn(async()=>new Response('{}',{status:503})));
 const response=await handler(new Request('https://site.example/api/cron/scrape-prices',{headers:{authorization:'Bearer test'}}));expect(response.status).toBe(500);expect((await response.json()).success).toBe(false);
});
