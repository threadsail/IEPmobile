-- Add role, first_name, last_name to public.profiles so profile info is read from one table.
-- Run in Supabase SQL Editor.

alter table public.profiles
  add column if not exists first_name text,
  add column if not exists last_name text,
  add column if not exists role text;

comment on column public.profiles.first_name is 'User first name';
comment on column public.profiles.last_name is 'User last name';
comment on column public.profiles.role is 'User role';
