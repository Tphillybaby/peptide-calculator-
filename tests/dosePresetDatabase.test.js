// @vitest-environment node
import { beforeAll, afterAll, it, expect } from 'vitest';
import { PGlite } from '@electric-sql/pglite';
import { readFileSync } from 'node:fs';
let db;
const owner='00000000-0000-0000-0000-000000000001', other='00000000-0000-0000-0000-000000000002';
beforeAll(async()=>{
 db=new PGlite();await db.exec(`create role anon; create role authenticated; create schema auth; grant usage on schema auth to authenticated; create table auth.users(id uuid primary key); create function auth.uid() returns uuid language sql as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$; insert into auth.users values ('${owner}'),('${other}');`);
 await db.exec(readFileSync(new URL('../supabase/migrations/20261112204846_saved_dose_presets.sql',import.meta.url),'utf8'));
},30000);
afterAll(async()=>{await db?.close();});
it('allows owner CRUD but blocks other accounts, reassignment, and anonymous access',async()=>{
 await db.exec(`set role authenticated; select set_config('request.jwt.claim.sub','${owner}',false); insert into dose_presets(user_id,name,peptide,dosage,unit) values ('${owner}','Test','A',1,'mg');`);
 expect((await db.query('select count(*)::int n from dose_presets')).rows[0].n).toBe(1);
 await expect(db.exec(`update dose_presets set user_id='${other}'`)).rejects.toThrow();
 await db.exec(`select set_config('request.jwt.claim.sub','${other}',false);`);
 expect((await db.query('select count(*)::int n from dose_presets')).rows[0].n).toBe(0);
 await expect(db.exec(`insert into dose_presets(user_id,name,peptide,dosage,unit) values ('${owner}','Test','A',1,'mg')`)).rejects.toThrow();
 await db.exec(`select set_config('request.jwt.claim.sub','${owner}',false); update dose_presets set dosage=2; delete from dose_presets;`);
 expect((await db.query('select count(*)::int n from dose_presets')).rows[0].n).toBe(0);
 await db.exec('reset role; set role anon;');await expect(db.query('select * from dose_presets')).rejects.toThrow();
});
