// @vitest-environment node
import { beforeAll, afterAll, it, expect } from 'vitest';
import { PGlite } from '@electric-sql/pglite';
import { readFileSync } from 'node:fs';
const admin='00000000-0000-0000-0000-000000000001', member='00000000-0000-0000-0000-000000000002';
let db;
beforeAll(async()=>{db=new PGlite();await db.exec(`
 create role authenticated;create role anon;create schema auth;create schema peptidelog_private;grant usage on schema auth to authenticated,anon;
 create function auth.uid() returns uuid language sql as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
 create table profiles(id uuid primary key,is_admin boolean default false,has_market_access boolean default false,created_at timestamptz default now());
 insert into profiles(id,is_admin) values('${admin}',true),('${member}',false);
 create function public.is_admin() returns boolean language sql stable security definer set search_path='public' as $$ select coalesce((select is_admin from profiles where id=auth.uid()),false) $$;
 create table injections(user_id uuid,injection_date timestamptz);insert into injections values('${member}',now()),('${member}',now()),('${admin}',now());
 create table schedules(user_id uuid);create table peptides(id uuid);create table reviews(user_id uuid);create table user_subscriptions(user_id uuid,status text,plan text,current_period_end timestamptz);
 create table audit_logs(user_id uuid);create table support_tickets(user_id uuid,status text);
 grant select on audit_logs,support_tickets,user_subscriptions to authenticated,anon;grant insert on audit_logs to authenticated;
 alter table audit_logs enable row level security;alter table support_tickets enable row level security;alter table user_subscriptions enable row level security;
 create policy public_select_audit_logs on audit_logs for select using(true);create policy public_select_support_tickets on support_tickets for select using(true);create policy public_select_user_subscriptions on user_subscriptions for select using(true);
 create policy audit_owner on audit_logs for select using(auth.uid()=user_id or public.is_admin());create policy ticket_owner on support_tickets for select using(auth.uid()=user_id or public.is_admin());create policy sub_owner on user_subscriptions for select using(auth.uid()=user_id);
 insert into audit_logs values('${member}');insert into support_tickets values('${member}','open');insert into user_subscriptions values('${member}','active','premium',null);
 `);await db.exec(readFileSync(new URL('../supabase/migrations/20261112220005_admin_access_and_reporting.sql',import.meta.url),'utf8'));await db.exec(readFileSync(new URL('../supabase/migrations/20261112222621_protect_market_access.sql',import.meta.url),'utf8'));await db.exec('create trigger protect_admin_column before insert or update on profiles for each row execute function protect_admin_column(); grant select,update on profiles to authenticated;');},30000);
afterAll(async()=>await db?.close());
it('denies anonymous and non-admin reports and access changes',async()=>{
 await db.exec('set role anon');await expect(db.query('select get_admin_overview(7)')).rejects.toThrow();
 expect((await db.query('select count(*)::int n from audit_logs')).rows[0].n).toBe(0);
 expect((await db.query('select count(*)::int n from support_tickets')).rows[0].n).toBe(0);
 expect((await db.query('select count(*)::int n from user_subscriptions')).rows[0].n).toBe(0);
 await db.exec(`reset role;set role authenticated;select set_config('request.jwt.claim.sub','${member}',false);`);
 await expect(db.query('select get_admin_overview(7)')).rejects.toThrow('Admin access required');
 await expect(db.query(`select admin_set_access('${member}',true)`)).rejects.toThrow('Admin access required');
 await expect(db.exec(`update profiles set has_market_access=true where id='${member}'`)).rejects.toThrow('Only admins');
 await expect(db.exec(`insert into audit_logs values('${admin}')`)).rejects.toThrow();
});
it('counts distinct active accounts and global doses without exposing raw records',async()=>{
 await db.exec(`reset role;set role authenticated;select set_config('request.jwt.claim.sub','${admin}',false);`);
 const row=(await db.query('select get_admin_overview(7) data')).rows[0].data;expect(row.injections).toBe(3);expect(row.activeUsers).toBe(2);expect(row.premiumUsers).toBe(1);
 const counts=(await db.query(`select admin_user_counts('${member}') data`)).rows[0].data;expect(counts.injections).toBe(2);
 await expect(db.query('select get_admin_overview(365)')).rejects.toThrow('Unsupported reporting period');
});
it('allows an admin to update another account but prevents changing their own admin status',async()=>{
 await expect(db.query(`select admin_set_access('${admin}',false)`)).rejects.toThrow('own admin status');
 const row=(await db.query(`select admin_set_access('${member}',true,true) data`)).rows[0].data;expect(row.is_admin).toBe(true);expect(row.has_market_access).toBe(true);
});
