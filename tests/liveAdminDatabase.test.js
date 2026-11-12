// @vitest-environment node
import {beforeAll,afterAll,it,expect} from 'vitest';
import {PGlite} from '@electric-sql/pglite';
import {readFileSync} from 'node:fs';
let db;const admin='00000000-0000-0000-0000-000000000001',member='00000000-0000-0000-0000-000000000002';
beforeAll(async()=>{db=new PGlite();await db.exec(`
 create role anon;create role authenticated;create schema auth;create schema peptidelog_private;
 grant usage on schema auth to anon,authenticated;
 create table auth.users(id uuid primary key);
 create function auth.uid() returns uuid language sql as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
 create table profiles(id uuid primary key,email text,full_name text,avatar_url text,weight_lbs numeric,is_admin boolean default false,has_market_access boolean default false,subscription_tier text default 'free',subscription_expires_at timestamptz,stripe_customer_id text,subscription_status text);
 insert into profiles(id,email,full_name,weight_lbs,is_admin) values('${admin}','admin@private.example','Public Admin',200,true),('${member}','member@private.example','Public Member',180,false);
 create function public.is_admin() returns boolean language sql stable security definer set search_path='public' as $$select coalesce((select is_admin from profiles where id=auth.uid()),false)$$;
 grant select,update on profiles to anon,authenticated;alter table profiles enable row level security;
 create policy profiles_select on profiles for select using(true);create policy public_select_profiles on profiles for select using(true);create policy own_update on profiles for update to authenticated using(auth.uid()=id) with check(auth.uid()=id);
 create view admin_users_view as select * from profiles;grant select on admin_users_view to anon,authenticated;
 create function protect_admin_column() returns trigger language plpgsql as $$begin return NEW;end$$;
 create trigger protect_admin_column before insert or update on profiles for each row execute function protect_admin_column();
 create table forum_topics(id uuid primary key,category_id uuid,user_id uuid,title text,content text,is_pinned boolean,is_locked boolean,view_count int,created_at timestamptz,updated_at timestamptz,is_private boolean default false);
 create table forum_posts(id uuid,topic_id uuid,user_id uuid,content text,is_solution boolean,created_at timestamptz,updated_at timestamptz);
 create table reviews(id uuid,user_id uuid,peptide_name text,rating int,comment text,created_at timestamptz);
 alter table forum_topics enable row level security;create policy topics_public on forum_topics for select using(not is_private);
 alter table forum_posts enable row level security;create policy posts_public on forum_posts for select using(exists(select 1 from forum_topics where id=topic_id));
 alter table reviews enable row level security;create policy review_public on reviews for select using(true);
 grant select on forum_topics,forum_posts,reviews to anon,authenticated;
 create view forum_topics_with_profiles as select ft.id,ft.category_id,ft.user_id,ft.title,ft.content,ft.is_pinned,ft.is_locked,ft.view_count,ft.created_at,ft.updated_at,p.email,p.full_name,p.avatar_url from forum_topics ft left join profiles p on p.id=ft.user_id;
 create view forum_posts_with_profiles as select fp.id,fp.topic_id,fp.user_id,fp.content,fp.is_solution,fp.created_at,fp.updated_at,p.email,p.full_name,p.avatar_url from forum_posts fp left join profiles p on p.id=fp.user_id;
 create view reviews_with_profiles as select r.id,r.user_id,r.peptide_name,r.rating,r.comment,r.created_at,p.email,p.full_name,p.avatar_url from reviews r left join profiles p on p.id=r.user_id;
 grant select on forum_topics_with_profiles,forum_posts_with_profiles,reviews_with_profiles to anon,authenticated;
 insert into forum_topics(id,user_id,title,is_private) values('10000000-0000-0000-0000-000000000001','${member}','Public topic',false),('10000000-0000-0000-0000-000000000002','${member}','Private topic',true);
 `);await db.exec(readFileSync(new URL('../supabase/migrations/20261112224010_live_admin_controls_and_profile_privacy.sql',import.meta.url),'utf8'));},30000);
afterAll(async()=>await db?.close());
const role=async(name,id='')=>db.exec(`reset role;set role ${name};select set_config('request.jwt.claim.sub','${id}',false);`);
it('hides full profiles and admin views, preserves only public author fields, and respects private-topic RLS',async()=>{
 await role('anon');expect((await db.query('select count(*)::int n from profiles')).rows[0].n).toBe(0);expect((await db.query('select count(*)::int n from admin_users_view')).rows[0].n).toBe(0);
 const rows=(await db.query('select * from public_profiles')).rows;expect(rows).toHaveLength(2);expect(Object.keys(rows[0]).sort()).toEqual(['avatar_url','full_name','id']);
 const topics=(await db.query('select title,email,full_name from forum_topics_with_profiles')).rows;expect(topics).toEqual([{title:'Public topic',email:null,full_name:'Public Member'}]);
 await role('authenticated',member);expect((await db.query('select count(*)::int n from profiles')).rows[0].n).toBe(1);
 await expect(db.exec(`update profiles set subscription_tier='premium' where id='${member}'`)).rejects.toThrow('trusted update');
});
it('limits live configuration writes to admins',async()=>{
 await role('authenticated',member);await db.exec("update feature_flags set enabled=false where key='forum';update site_settings set maintenance_mode=true;");
 expect((await db.query("select enabled from feature_flags where key='forum'")).rows[0].enabled).toBe(true);
 await role('authenticated',admin);await db.exec("update feature_flags set enabled=false where key='forum';");expect((await db.query("select enabled from feature_flags where key='forum'")).rows[0].enabled).toBe(false);
});
it('publishes only enabled announcements in their time window',async()=>{
 await role('authenticated',admin);await db.exec("insert into announcements(title,message,enabled) values('Visible','Message',true),('Draft','Hidden',false);insert into announcements(title,message,enabled,starts_at) values('Future','Hidden',true,now()+interval '1 day');");
 await role('anon');expect((await db.query('select title from announcements')).rows.map(r=>r.title)).toEqual(['Visible']);
});
it('enforces the registration switch on auth user creation',async()=>{
 await role('authenticated',admin);await db.exec('update site_settings set registration_enabled=false');await role('anon');
 // Simulate the trusted auth service inserting a new account; the trigger still enforces the switch.
 await db.exec('reset role');await expect(db.exec("insert into auth.users values('20000000-0000-0000-0000-000000000001')")).rejects.toThrow('registration is temporarily closed');
 await db.exec('update site_settings set registration_enabled=true');await db.exec("insert into auth.users values('20000000-0000-0000-0000-000000000001')");
});
