-- Private admin reporting: aggregate counts only; raw dose records remain owner-only.
grant usage on schema peptidelog_private to authenticated;
create function peptidelog_private.admin_overview(p_days integer default 30) returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare result jsonb;
begin
 if not public.is_admin() then raise exception 'Admin access required' using errcode='42501'; end if;
 if p_days not in (7,30,90) then raise exception 'Unsupported reporting period'; end if;
 select jsonb_build_object(
  'users',(select count(*) from public.profiles),
  'injections',(select count(*) from public.injections),
  'peptides',(select count(*) from public.peptides),
  'reviews',(select count(*) from public.reviews),
  'schedules',(select count(*) from public.schedules),
  'openTickets',(select count(*) from public.support_tickets where status='open'),
  'newUsers',(select count(*) from public.profiles where created_at >= now()-make_interval(days=>p_days)),
  'activeUsers',(select count(distinct user_id) from public.injections where injection_date >= now()-make_interval(days=>p_days) and injection_date <= now()),
  'periodInjections',(select count(*) from public.injections where injection_date >= now()-make_interval(days=>p_days) and injection_date <= now()),
  'previousInjections',(select count(*) from public.injections where injection_date >= now()-make_interval(days=>2*p_days) and injection_date < now()-make_interval(days=>p_days)),
  'premiumUsers',(select count(distinct user_id) from public.user_subscriptions where status='active' and plan in ('premium','pro') and (current_period_end is null or current_period_end > now()))
 ) into result;
 return result;
end $$;
revoke all on function peptidelog_private.admin_overview(integer) from public,anon;
grant execute on function peptidelog_private.admin_overview(integer) to authenticated;
create function public.get_admin_overview(p_days integer default 30) returns jsonb language sql stable security invoker set search_path = '' as $$ select peptidelog_private.admin_overview(p_days) $$;
revoke all on function public.get_admin_overview(integer) from public,anon;
grant execute on function public.get_admin_overview(integer) to authenticated;

-- Remove permissive policies that defeated owner/admin restrictions on admin data.
drop policy if exists public_select_audit_logs on public.audit_logs;
drop policy if exists public_select_support_tickets on public.support_tickets;
drop policy if exists public_select_user_subscriptions on public.user_subscriptions;
drop policy if exists audit_logs_insert on public.audit_logs;
create policy audit_logs_insert on public.audit_logs for insert to authenticated with check ((select auth.uid())=user_id);

create function peptidelog_private.admin_set_access(p_user_id uuid, p_is_admin boolean default null, p_has_market_access boolean default null) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare result jsonb;
begin
 if not public.is_admin() then raise exception 'Admin access required' using errcode='42501'; end if;
 if p_user_id=auth.uid() and p_is_admin is not null then raise exception 'You cannot change your own admin status'; end if;
 if p_is_admin is null and p_has_market_access is null then raise exception 'No access change requested'; end if;
 update public.profiles set is_admin=coalesce(p_is_admin,is_admin),has_market_access=coalesce(p_has_market_access,has_market_access)
 where id=p_user_id returning jsonb_build_object('id',id,'is_admin',is_admin,'has_market_access',has_market_access) into result;
 if result is null then raise exception 'Account not found'; end if;
 return result;
end $$;
revoke all on function peptidelog_private.admin_set_access(uuid,boolean,boolean) from public,anon;
grant execute on function peptidelog_private.admin_set_access(uuid,boolean,boolean) to authenticated;
create function public.admin_set_access(p_user_id uuid,p_is_admin boolean default null,p_has_market_access boolean default null) returns jsonb language sql security invoker set search_path = '' as $$ select peptidelog_private.admin_set_access(p_user_id,p_is_admin,p_has_market_access) $$;
revoke all on function public.admin_set_access(uuid,boolean,boolean) from public,anon;
grant execute on function public.admin_set_access(uuid,boolean,boolean) to authenticated;

create function peptidelog_private.admin_user_counts(p_user_id uuid) returns jsonb language plpgsql stable security definer set search_path = '' as $$
begin
 if not public.is_admin() then raise exception 'Admin access required' using errcode='42501'; end if;
 return jsonb_build_object('injections',(select count(*) from public.injections where user_id=p_user_id),'schedules',(select count(*) from public.schedules where user_id=p_user_id),'reviews',(select count(*) from public.reviews where user_id=p_user_id));
end $$;
revoke all on function peptidelog_private.admin_user_counts(uuid) from public,anon;
grant execute on function peptidelog_private.admin_user_counts(uuid) to authenticated;
create function public.admin_user_counts(p_user_id uuid) returns jsonb language sql stable security invoker set search_path = '' as $$ select peptidelog_private.admin_user_counts(p_user_id) $$;
revoke all on function public.admin_user_counts(uuid) from public,anon;
grant execute on function public.admin_user_counts(uuid) to authenticated;
