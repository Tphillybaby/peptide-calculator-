-- MIGRATION: Add schedules table
-- Run this in the Supabase SQL Editor (https://supabase.com/dashboard -> Your Project -> SQL Editor)

-- Create schedules table for injection scheduling
create table if not exists public.schedules (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  peptide_name text not null,
  dosage numeric not null,
  unit text not null default 'mg',
  scheduled_date date not null,
  scheduled_time time not null,
  completed boolean default false,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table public.schedules enable row level security;

-- Drop existing policies if they exist (safe to run multiple times)
drop policy if exists "Users can view own schedules." on schedules;
drop policy if exists "Users can insert own schedules." on schedules;
drop policy if exists "Users can update own schedules." on schedules;
drop policy if exists "Users can delete own schedules." on schedules;

-- Create RLS policies
create policy "Users can view own schedules."
  on schedules for select
  using ( auth.uid() = user_id );

create policy "Users can insert own schedules."
  on schedules for insert
  with check ( auth.uid() = user_id );

create policy "Users can update own schedules."
  on schedules for update
  using ( auth.uid() = user_id );

create policy "Users can delete own schedules."
  on schedules for delete
  using ( auth.uid() = user_id );

-- Success message
select 'Schedules table created successfully!' as status;
