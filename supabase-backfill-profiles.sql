-- Backfill profile rows for existing auth users so the profile page can read
-- username, first name, last name, role, and profile created date from Supabase.
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor). Uses the service role so RLS doesn't block.

-- 1. Ensure every auth user has a row in public.profiles (for username, created_at, updated_at)
insert into public.profiles (id, username, created_at, updated_at)
select
  u.id,
  coalesce(u.raw_user_meta_data->>'username', 'user_' || substr(u.id::text, 1, 8)),
  u.created_at,
  now()
from auth.users u
where not exists (select 1 from public.profiles p where p.id = u.id)
on conflict (id) do update set
  updated_at = now();

-- 2. Ensure every auth user has a row in admin.profiles (for first_name, last_name, role)
-- Requires admin.profiles to exist (run supabase-admin-schema.sql first).
-- If the table has no INSERT policy for users, run this as superuser in SQL Editor.
insert into admin.profiles (id, role, first_name, last_name, created_at, updated_at)
select
  u.id,
  null,
  null,
  null,
  u.created_at,
  now()
from auth.users u
where not exists (select 1 from admin.profiles p where p.id = u.id)
on conflict (id) do nothing;

-- Optional: set subscription_plan and subscription_interval columns if they exist
-- alter table admin.profiles add column if not exists subscription_plan text default 'starter';
-- alter table admin.profiles add column if not exists subscription_interval text default 'monthly';
