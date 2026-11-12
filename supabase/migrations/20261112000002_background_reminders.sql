begin;
-- Existing rows have no reliable timezone. Do not invent UTC times for them.
-- Re-saving/recreating a schedule records its actual UTC instant.
alter table public.schedules add column if not exists scheduled_at timestamptz;
create index if not exists schedules_due_reminders on public.schedules(scheduled_at) where not completed;
create table public.push_subscriptions (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    endpoint text not null unique,
    subscription jsonb not null,
    created_at timestamptz not null default now()
);
alter table public.push_subscriptions enable row level security;
grant select, insert, update, delete on public.push_subscriptions to authenticated, service_role;
create policy own_push_subscriptions on public.push_subscriptions for all to authenticated
using (auth.uid() = user_id) with check (auth.uid() = user_id);
create table public.reminder_deliveries (
    schedule_id uuid references public.schedules(id) on delete cascade,
    subscription_id uuid references public.push_subscriptions(id) on delete cascade,
    scheduled_at timestamptz not null,
    minutes integer not null check (minutes in (0,30)),
    lease_token uuid not null,
    lease_until timestamptz not null,
    sent_at timestamptz,
    primary key (schedule_id, subscription_id, scheduled_at, minutes)
);
alter table public.reminder_deliveries enable row level security;
revoke all on public.reminder_deliveries from anon, authenticated;
grant select, insert, update, delete on public.reminder_deliveries to service_role;
create function public.claim_reminder_delivery(p_schedule_id uuid, p_subscription_id uuid, p_scheduled_at timestamptz, p_minutes integer, p_token uuid)
returns boolean language sql security invoker set search_path = public, pg_temp as $$
    with claimed as (
        insert into public.reminder_deliveries values (p_schedule_id,p_subscription_id,p_scheduled_at,p_minutes,p_token,now()+interval '1 minute',null)
        on conflict (schedule_id,subscription_id,scheduled_at,minutes) do update
        set lease_token=excluded.lease_token, lease_until=excluded.lease_until
        where reminder_deliveries.sent_at is null and reminder_deliveries.lease_until < now()
        returning 1
    ) select exists(select 1 from claimed);
$$;
revoke all on function public.claim_reminder_delivery(uuid,uuid,timestamptz,integer,uuid) from public;
grant execute on function public.claim_reminder_delivery(uuid,uuid,timestamptz,integer,uuid) to service_role;
commit;
