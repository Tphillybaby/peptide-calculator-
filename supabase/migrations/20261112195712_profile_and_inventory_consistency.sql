begin;
create schema if not exists peptidelog_private;
revoke all on schema peptidelog_private from public, anon, authenticated;
alter table public.profiles add column if not exists age integer;
alter table public.profiles add column if not exists gender text;
alter table public.profiles add column if not exists weight_goal text;
alter table public.profiles add column if not exists notification_preferences jsonb default '{}'::jsonb;

-- Track exactly which vials each new injection consumed. Never guess historical allocations.
create table public.injection_inventory_allocations (
    injection_id uuid not null references public.injections(id) on delete cascade,
    inventory_id uuid not null references public.inventory(id) on delete cascade,
    amount_mg numeric not null check (amount_mg > 0),
    primary key (injection_id, inventory_id)
);
alter table public.injection_inventory_allocations enable row level security;
-- No client writes: the trigger alone maintains this ledger.
revoke all on public.injection_inventory_allocations from anon, authenticated;
alter table public.injections add column inventory_sync_version integer not null default 0;
alter table public.injections add column inventory_baseline_mg numeric not null default 0;
update public.injections set inventory_baseline_mg = greatest(0, coalesce(case dosage_unit when 'mg' then dosage_value when 'mcg' then dosage_value / 1000 else 0 end, 0));

create function peptidelog_private.sync_injection_inventory() returns trigger
language plpgsql security definer set search_path = public, pg_temp as $$
declare
    allocation record;
    vial record;
    needed numeric;
    deducted numeric;
    old_mass numeric := 0;
begin
    if auth.uid() is not null and auth.uid() is distinct from (case when TG_OP = 'DELETE' then OLD.user_id else NEW.user_id end) then
        raise exception 'Injection ownership mismatch';
    end if;
    -- Cached older clients still perform their own insert-time deduction.
    if TG_OP = 'INSERT' and NEW.inventory_sync_version <> 1 then return NEW; end if;
    if TG_OP = 'UPDATE' and NEW.user_id is distinct from OLD.user_id then
        raise exception 'Injection owner cannot be changed';
    end if;
    if TG_OP = 'UPDATE' and (NEW.dosage_value, NEW.dosage_unit, NEW.peptide_name) is not distinct from (OLD.dosage_value, OLD.dosage_unit, OLD.peptide_name) then
        return NEW;
    end if;
    -- Serialize all injection mutations per owner; row locks protect each vial too.
    perform pg_advisory_xact_lock(hashtextextended(case when TG_OP = 'DELETE' then OLD.user_id::text else NEW.user_id::text end, 0));
    if TG_OP in ('UPDATE', 'DELETE') then
        for allocation in select * from public.injection_inventory_allocations where injection_id = OLD.id loop
            update public.inventory set remaining_mg = remaining_mg + allocation.amount_mg
            where id = allocation.inventory_id and user_id = OLD.user_id;
        end loop;
        delete from public.injection_inventory_allocations where injection_id = OLD.id;
        if TG_OP = 'DELETE' then return OLD; end if;
        -- Preserve historical consumption, which has no reliable vial allocation.
        old_mass := OLD.inventory_baseline_mg;
        if old_mass > 0 and (NEW.peptide_name is distinct from OLD.peptide_name or NEW.dosage_unit is distinct from OLD.dosage_unit) then
            raise exception 'Historical injection: reconcile inventory manually before changing peptide or units.';
        end if;
    end if;
    needed := case NEW.dosage_unit when 'mg' then NEW.dosage_value when 'mcg' then NEW.dosage_value / 1000 else 0 end;
    if needed is null or needed < 0 then raise exception 'Invalid injection dosage'; end if;
    if needed < old_mass then
        raise exception 'Historical injection: reconcile inventory manually before reducing the original dose.';
    end if;
    needed := needed - old_mass;
    for vial in select id, remaining_mg from public.inventory
        where user_id = NEW.user_id and peptide_name = NEW.peptide_name and remaining_mg > 0
        order by created_at, id for update loop
        exit when needed <= 0;
        deducted := least(vial.remaining_mg, needed);
        update public.inventory set remaining_mg = remaining_mg - deducted where id = vial.id;
        insert into public.injection_inventory_allocations values (NEW.id, vial.id, deducted);
        needed := needed - deducted;
    end loop;
    return NEW;
end;
$$;
revoke all on function peptidelog_private.sync_injection_inventory() from public, anon, authenticated;

-- BEFORE DELETE lets the trigger restore allocations before FK cascades remove them.
create trigger injection_inventory_delete before delete on public.injections
for each row execute function peptidelog_private.sync_injection_inventory();
create trigger injection_inventory_write after insert or update of dosage_value, dosage_unit, peptide_name, user_id on public.injections
for each row execute function peptidelog_private.sync_injection_inventory();
-- A separate BEFORE INSERT marks only new records as fully managed.
create function peptidelog_private.mark_injection_inventory_managed() returns trigger
language plpgsql set search_path = public, pg_temp as $$
begin
    if TG_OP = 'INSERT' then
        NEW.inventory_baseline_mg := case when NEW.inventory_sync_version = 1 then 0 else greatest(0, coalesce(case NEW.dosage_unit when 'mg' then NEW.dosage_value when 'mcg' then NEW.dosage_value / 1000 else 0 end, 0)) end;
    else
        NEW.inventory_baseline_mg := OLD.inventory_baseline_mg;
        NEW.inventory_sync_version := OLD.inventory_sync_version;
    end if;
    return NEW;
end;
$$;
revoke all on function peptidelog_private.mark_injection_inventory_managed() from public, anon, authenticated;
create trigger injection_inventory_managed before insert or update on public.injections
for each row execute function peptidelog_private.mark_injection_inventory_managed();
commit;
