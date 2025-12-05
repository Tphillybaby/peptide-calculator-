-- Create profiles table
create table public.profiles (
  id uuid references auth.users not null primary key,
  email text,
  full_name text,
  avatar_url text,
  updated_at timestamp with time zone,
  
  constraint username_length check (char_length(full_name) >= 3)
);

-- Set up Row Level Security (RLS)
alter table public.profiles enable row level security;

create policy "Public profiles are viewable by everyone."
  on profiles for select
  using ( true );

create policy "Users can insert their own profile."
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on profiles for update
  using ( auth.uid() = id );

-- Create peptides table (Master list)
create table public.peptides (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  category text not null,
  half_life_hours numeric,
  description text,
  benefits text[],
  side_effects text[],
  warnings text[],
  dosage_protocols jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.peptides enable row level security;

create policy "Peptides are viewable by everyone."
  on peptides for select
  using ( true );

-- Create injections table
create table public.injections (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  peptide_name text not null,
  dosage_mcg numeric not null,
  injection_date timestamp with time zone not null,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.injections enable row level security;

create policy "Users can view own injections."
  on injections for select
  using ( auth.uid() = user_id );

create policy "Users can insert own injections."
  on injections for insert
  with check ( auth.uid() = user_id );

create policy "Users can update own injections."
  on injections for update
  using ( auth.uid() = user_id );

create policy "Users can delete own injections."
  on injections for delete
  using ( auth.uid() = user_id );

-- Create inventory table
create table public.inventory (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  peptide_name text not null,
  quantity_mg numeric not null,
  remaining_mg numeric not null,
  purchase_date date,
  expiration_date date,
  batch_number text,
  source text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.inventory enable row level security;

create policy "Users can view own inventory."
  on inventory for select
  using ( auth.uid() = user_id );

create policy "Users can manage own inventory."
  on inventory for all
  using ( auth.uid() = user_id );

-- Function to handle new user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger for new user signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Create reviews table
create table public.reviews (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  peptide_name text not null,
  rating integer not null check (rating >= 1 and rating <= 5),
  comment text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.reviews enable row level security;

create policy "Reviews are viewable by everyone."
  on reviews for select
  using ( true );

create policy "Users can insert their own reviews."
  on reviews for insert
  with check ( auth.uid() = user_id );

create policy "Users can update their own reviews."
  on reviews for update
  using ( auth.uid() = user_id );

create policy "Users can delete their own reviews."
  on reviews for delete
  using ( auth.uid() = user_id );
