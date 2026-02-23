-- Fix sign-up connection to the database: ensure public.profiles is ready for
-- the new-user trigger and that the trigger + policies allow inserts.
-- Run this entire script in Supabase SQL Editor (Dashboard → SQL Editor).

-- 1. Ensure public.profiles has all columns (id, username, first_name, last_name, full_name, role, etc.)
alter table public.profiles
  add column if not exists first_name text,
  add column if not exists last_name text,
  add column if not exists full_name text,
  add column if not exists role text;

-- 2. Allow trigger to insert: role must be one of teacher, aide, admin (or null).
alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles add constraint profiles_role_check
  check (role is null or role in ('teacher', 'aide', 'admin'));

-- 3. Replace new-user trigger: copy first_name, last_name, full_name, username from signup; set role = 'teacher'.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
declare
  fname text := nullif(trim(new.raw_user_meta_data->>'first_name'), '');
  lname text := nullif(trim(new.raw_user_meta_data->>'last_name'), '');
  uname text := coalesce(nullif(trim(new.raw_user_meta_data->>'username'), ''), 'user_' || substr(new.id::text, 1, 8));
  ffull text := nullif(trim(coalesce(fname, '') || ' ' || coalesce(lname, '')), '');
begin
  insert into public.profiles (id, username, first_name, last_name, full_name, role)
  values (new.id, uname, fname, lname, ffull, 'teacher');
  return new;
end;
$$;

-- 4. Ensure trigger exists on auth.users
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 5. Allow profile row to be created (trigger runs as definer; this helps if insert is ever done as the new user)
do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'profiles' and policyname = 'Users can insert own profile'
  ) then
    create policy "Users can insert own profile"
      on public.profiles for insert
      with check (auth.uid() = id);
  end if;
exception
  when duplicate_object then null; -- policy already exists
end
$$;
