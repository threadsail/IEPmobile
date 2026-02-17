-- Optional: run this in Supabase SQL Editor to store usernames in a profiles table.
-- Sign up sends username in user_metadata; you can read it via auth.users.raw_user_meta_data->>'username'
-- or sync it into public.profiles with this trigger.

-- Create profiles table
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS
alter table public.profiles enable row level security;

-- Users can read/update their own row
create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Sync new user + username from auth.users into profiles
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, username)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', 'user_' || substr(new.id::text, 1, 8))
  );
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Optional: allow users to insert their own row (e.g. if trigger is not used)
-- create policy "Users can insert own profile"
--   on public.profiles for insert
--   with check (auth.uid() = id);
