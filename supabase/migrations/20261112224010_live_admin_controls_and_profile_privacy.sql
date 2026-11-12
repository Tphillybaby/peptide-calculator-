-- Full profiles are private. Public community projections contain no email or health fields.
drop policy if exists profiles_select on public.profiles;
drop policy if exists public_select_profiles on public.profiles;
create policy profiles_owner_admin_read on public.profiles for select to authenticated using ((select auth.uid())=id or (select public.is_admin()));
alter view public.admin_users_view set (security_invoker=true);

grant usage on schema peptidelog_private to anon,authenticated;
create function peptidelog_private.community_profiles() returns table(id uuid,full_name text,avatar_url text)
language sql stable security definer set search_path='' as $$ select p.id,p.full_name,p.avatar_url from public.profiles p $$;
revoke all on function peptidelog_private.community_profiles() from public;
grant execute on function peptidelog_private.community_profiles() to anon,authenticated;
create view public.public_profiles with (security_invoker=true) as select * from peptidelog_private.community_profiles();
grant select on public.public_profiles to anon,authenticated;
create or replace view public.forum_topics_with_profiles with (security_invoker=true) as
 select ft.id,ft.category_id,ft.user_id,ft.title,ft.content,ft.is_pinned,ft.is_locked,ft.view_count,ft.created_at,ft.updated_at,null::text as email,p.full_name,p.avatar_url from public.forum_topics ft left join public.public_profiles p on ft.user_id=p.id;
create or replace view public.forum_posts_with_profiles with (security_invoker=true) as
 select fp.id,fp.topic_id,fp.user_id,fp.content,fp.is_solution,fp.created_at,fp.updated_at,null::text as email,p.full_name,p.avatar_url from public.forum_posts fp left join public.public_profiles p on fp.user_id=p.id;
create or replace view public.reviews_with_profiles with (security_invoker=true) as
 select r.id,r.user_id,r.peptide_name,r.rating,r.comment,r.created_at,null::text as email,p.full_name,p.avatar_url from public.reviews r left join public.public_profiles p on r.user_id=p.id;

create table public.site_settings (
 id boolean primary key default true check(id),site_name text not null default 'PeptideLog' check(length(trim(site_name)) between 1 and 80),
 site_description text not null default 'Your personal peptide management companion' check(length(site_description)<=300),
 support_email text not null default '' check(length(support_email)<=254),maintenance_mode boolean not null default false,registration_enabled boolean not null default true,updated_at timestamptz not null default now()
);
insert into public.site_settings(id) values(true);
alter table public.site_settings enable row level security;
grant select on public.site_settings to anon,authenticated;grant update on public.site_settings to authenticated;
create policy settings_read on public.site_settings for select using(true);
create policy settings_admin_update on public.site_settings for update to authenticated using((select public.is_admin())) with check((select public.is_admin()));

create table public.feature_flags (key text primary key check(key in ('price_checker','forum','encyclopedia','progress_analytics')),enabled boolean not null default true,updated_at timestamptz not null default now());
insert into public.feature_flags(key) values('price_checker'),('forum'),('encyclopedia'),('progress_analytics');
alter table public.feature_flags enable row level security;
grant select on public.feature_flags to anon,authenticated;grant update on public.feature_flags to authenticated;
create policy flags_read on public.feature_flags for select using(true);
create policy flags_admin_update on public.feature_flags for update to authenticated using((select public.is_admin())) with check((select public.is_admin()));

create table public.announcements (id uuid primary key default gen_random_uuid(),title text not null check(length(trim(title)) between 1 and 120),message text not null check(length(trim(message)) between 1 and 2000),enabled boolean not null default false,starts_at timestamptz,ends_at timestamptz,updated_at timestamptz not null default now(),check(ends_at is null or starts_at is null or ends_at>starts_at));
alter table public.announcements enable row level security;
grant select on public.announcements to anon,authenticated;grant insert,update,delete on public.announcements to authenticated;
create policy announcements_live_read on public.announcements for select using(enabled and (starts_at is null or starts_at<=now()) and (ends_at is null or ends_at>now()));
create policy announcements_admin on public.announcements for all to authenticated using((select public.is_admin())) with check((select public.is_admin()));

create function peptidelog_private.registration_guard() returns trigger language plpgsql security definer set search_path='' as $$
begin
 if exists(select 1 from public.site_settings where id=true and not registration_enabled) then raise exception 'New account registration is temporarily closed' using errcode='42501'; end if;
 return NEW;
end $$;
revoke all on function peptidelog_private.registration_guard() from public,anon,authenticated;
create trigger peptidelog_registration_guard before insert on auth.users for each row execute function peptidelog_private.registration_guard();

-- Billing and privilege fields cannot be self-assigned by a member.
create or replace function public.protect_admin_column() returns trigger language plpgsql set search_path='' as $$
begin
 if current_user not in ('authenticated','anon') or public.is_admin() then return NEW; end if;
 if TG_OP='INSERT' then
  if NEW.is_admin is true or NEW.has_market_access is true or coalesce(NEW.subscription_tier,'free')<>'free' or NEW.subscription_expires_at is not null or NEW.stripe_customer_id is not null or NEW.subscription_status is not null then raise exception 'Privileged account fields require a trusted update' using errcode='42501'; end if;
 elsif NEW.is_admin is distinct from OLD.is_admin or NEW.has_market_access is distinct from OLD.has_market_access or NEW.subscription_tier is distinct from OLD.subscription_tier or NEW.subscription_expires_at is distinct from OLD.subscription_expires_at or NEW.subscription_status is distinct from OLD.subscription_status or NEW.stripe_customer_id is distinct from OLD.stripe_customer_id then
  raise exception 'Privileged account fields require a trusted update' using errcode='42501';
 end if;
 return NEW;
end $$;
revoke all on public.site_settings,public.feature_flags,public.announcements from anon,authenticated;
grant select on public.site_settings,public.feature_flags,public.announcements to anon,authenticated;
grant update on public.site_settings,public.feature_flags to authenticated;
grant insert,update,delete on public.announcements to authenticated;
