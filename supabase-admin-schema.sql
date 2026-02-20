-- Optional: run this in Supabase SQL Editor when you want to store
-- role, first_name, last_name in the admin schema. The app already
-- reads these fields from admin.profiles (see get-profile.ts).

-- Create admin schema
create schema if not exists admin;

-- Profiles in admin schema (id matches auth.users.id)
create table if not exists admin.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text,
  first_name text,
  last_name text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS
alter table admin.profiles enable row level security;

-- Users can read/update their own row
create policy "Users can read own admin profile"
  on admin.profiles for select
  using (auth.uid() = id);

create policy "Users can update own admin profile"
  on admin.profiles for update
  using (auth.uid() = id);

-- Optional: allow insert so users can create their row
-- create policy "Users can insert own admin profile"
--   on admin.profiles for insert
--   with check (auth.uid() = id);
