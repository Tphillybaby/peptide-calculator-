create table public.dose_presets (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 name text not null check (length(trim(name)) between 1 and 80),
 peptide text not null check (length(trim(peptide)) between 1 and 200),
 dosage numeric not null check (dosage > 0 and dosage < 1000000000),
 unit text not null check (unit in ('mg','mcg','iu')),
 created_at timestamptz not null default now()
);
create index dose_presets_user_id_idx on public.dose_presets(user_id);
alter table public.dose_presets enable row level security;
revoke all on public.dose_presets from anon;
grant select, insert, update, delete on public.dose_presets to authenticated;
create policy dose_presets_owner_select on public.dose_presets for select to authenticated using ((select auth.uid()) = user_id);
create policy dose_presets_owner_insert on public.dose_presets for insert to authenticated with check ((select auth.uid()) = user_id);
create policy dose_presets_owner_update on public.dose_presets for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy dose_presets_owner_delete on public.dose_presets for delete to authenticated using ((select auth.uid()) = user_id);
