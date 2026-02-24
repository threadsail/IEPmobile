-- Activities in admin schema. Access via RPCs only (no direct client access to admin).
-- Run in Supabase SQL Editor. Run after admin schema exists (e.g. supabase-signup-fix.sql).

create schema if not exists admin;

create table if not exists admin.activities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text,
  activity_type text not null default 'create' check (activity_type in ('create', 'youtube')),
  youtube_url text,
  usage_count integer not null default 0,
  icon text,
  color text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists activities_user_id_idx on admin.activities(user_id);

-- -----------------------------------------------------------------------------
-- RPC: list current user's activities
-- -----------------------------------------------------------------------------
create or replace function public.get_my_activities()
returns setof admin.activities
language plpgsql
security definer
set search_path = ''
as $$
begin
  return query
  select a.id, a.user_id, a.name, a.description, a.activity_type, a.youtube_url,
         a.usage_count, a.icon, a.color, a.created_at, a.updated_at
  from admin.activities a
  where a.user_id = auth.uid()
  order by a.name;
end;
$$;

-- -----------------------------------------------------------------------------
-- RPC: create activity (called from dashboard/activities/actions)
-- -----------------------------------------------------------------------------
create or replace function public.create_activity(
  p_name text,
  p_description text default null,
  p_activity_type text default 'create',
  p_youtube_url text default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  new_id uuid;
begin
  if auth.uid() is null then return null; end if;
  if nullif(trim(p_name), '') is null then return null; end if;
  insert into admin.activities (user_id, name, description, activity_type, youtube_url, usage_count)
  values (
    auth.uid(),
    trim(p_name),
    nullif(trim(coalesce(p_description, '')), ''),
    case when p_activity_type = 'youtube' then 'youtube' else 'create' end,
    nullif(trim(coalesce(p_youtube_url, '')), ''),
    0
  )
  returning id into new_id;
  return new_id;
end;
$$;

-- Remove old public.activities if it existed (run once after migrating)
-- drop table if exists public.activities cascade;
