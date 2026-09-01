-- Per-person schedules: each org member has their own schedule; staff can edit org schedules.
-- Run in Supabase SQL Editor after supabase-schedule.sql (creates admin.schedule_entries).
-- This file is self-contained: it also creates get_my_schedule_organization_ids() if missing.

create schema if not exists admin;

-- -----------------------------------------------------------------------------
-- 0. Prerequisites (no-op if supabase-schedule.sql / teacher-aide-links already ran)
-- -----------------------------------------------------------------------------
create table if not exists admin.teacher_aide_links (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references auth.users(id) on delete cascade,
  aide_id uuid not null references auth.users(id) on delete cascade,
  organization_id uuid not null references admin.organization(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (teacher_id, aide_id),
  check (teacher_id <> aide_id)
);

create index if not exists teacher_aide_links_aide_idx on admin.teacher_aide_links(aide_id);
create index if not exists teacher_aide_links_org_idx on admin.teacher_aide_links(organization_id);

create or replace function public.get_my_schedule_organization_ids()
returns setof uuid
language sql
security definer
stable
set search_path = ''
as $$
  select p.organization_id
  from public.profiles p
  where p.id = auth.uid() and p.organization_id is not null
  union
  select l.organization_id
  from admin.teacher_aide_links l
  where l.aide_id = auth.uid();
$$;

grant execute on function public.get_my_schedule_organization_ids() to authenticated;

-- -----------------------------------------------------------------------------
-- 1. owner_user_id on schedule entries
-- -----------------------------------------------------------------------------
alter table admin.schedule_entries
  add column if not exists owner_user_id uuid references auth.users(id) on delete cascade;

update admin.schedule_entries e
set owner_user_id = o.owner_id
from admin.organization o
where e.organization_id = o.id
  and e.owner_user_id is null
  and o.owner_id is not null;

update admin.schedule_entries e
set owner_user_id = (
  select p.id
  from public.profiles p
  where p.organization_id = e.organization_id
    and p.role in ('Teacher', 'Admin')
  order by p.created_at nulls last
  limit 1
)
where e.owner_user_id is null;

delete from admin.schedule_entries where owner_user_id is null;

alter table admin.schedule_entries alter column owner_user_id set not null;

drop index if exists admin.schedule_entries_owner_date_idx;
create index if not exists schedule_entries_owner_date_idx
  on admin.schedule_entries(owner_user_id, schedule_date);

-- -----------------------------------------------------------------------------
-- 2. Permission helpers
-- -----------------------------------------------------------------------------
create or replace function public.can_view_schedule_for(p_owner_user_id uuid)
returns boolean
language sql
security definer
stable
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles owner
    where owner.id = p_owner_user_id
      and owner.organization_id is not null
      and owner.organization_id in (select public.get_my_schedule_organization_ids())
  );
$$;

grant execute on function public.can_view_schedule_for(uuid) to authenticated;

create or replace function public.can_edit_schedule_for(p_owner_user_id uuid)
returns boolean
language sql
security definer
stable
set search_path = ''
as $$
  select case
    when auth.uid() is null then false
    when not public.can_view_schedule_for(p_owner_user_id) then false
    when auth.uid() = p_owner_user_id then exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role in ('Teacher', 'Admin')
    )
    else exists (
      select 1
      from public.profiles me
      join public.profiles owner on owner.id = p_owner_user_id
      where me.id = auth.uid()
        and me.organization_id = owner.organization_id
        and me.role in ('Teacher', 'Admin')
    )
  end;
$$;

grant execute on function public.can_edit_schedule_for(uuid) to authenticated;

-- -----------------------------------------------------------------------------
-- 3. Roster: org members whose schedules the current user can view
-- -----------------------------------------------------------------------------
drop function if exists public.get_schedule_roster();

create function public.get_schedule_roster()
returns table (
  user_id uuid,
  display_name text,
  role text,
  can_edit boolean
)
language plpgsql
security definer
stable
set search_path = ''
as $$
begin
  if auth.uid() is null then return; end if;

  return query
  select
    p.id as user_id,
    coalesce(
      nullif(trim(coalesce(p.first_name, '') || ' ' || coalesce(p.last_name, '')), ''),
      nullif(trim(coalesce(p.full_name, '')), ''),
      nullif(trim(coalesce(p.username, '')), ''),
      'User'
    ) as display_name,
    p.role,
    public.can_edit_schedule_for(p.id) as can_edit
  from public.profiles p
  where p.organization_id in (select public.get_my_schedule_organization_ids())
  order by
    case p.role when 'Teacher' then 0 when 'Admin' then 0 when 'Aide' then 1 else 2 end,
    coalesce(
      nullif(trim(coalesce(p.first_name, '') || ' ' || coalesce(p.last_name, '')), ''),
      nullif(trim(coalesce(p.full_name, '')), ''),
      nullif(trim(coalesce(p.username, '')), ''),
      'User'
    );
end;
$$;

grant execute on function public.get_schedule_roster() to authenticated;

-- -----------------------------------------------------------------------------
-- 4. Schedule RPCs (per owner)
-- -----------------------------------------------------------------------------
drop function if exists public.get_schedule_entries(date, date);

create function public.get_schedule_entries(
  p_date_from date,
  p_date_to date,
  p_owner_user_id uuid default null
)
returns table (
  id uuid,
  organization_id uuid,
  owner_user_id uuid,
  name text,
  activity_id uuid,
  schedule_date date,
  start_time time,
  end_time time,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  owner_id uuid := coalesce(p_owner_user_id, auth.uid());
begin
  if auth.uid() is null or owner_id is null then return; end if;
  if not public.can_view_schedule_for(owner_id) then return; end if;

  return query
  select e.id, e.organization_id, e.owner_user_id, e.name, e.activity_id,
         e.schedule_date, e.start_time, e.end_time, e.created_at
  from admin.schedule_entries e
  where e.schedule_date >= p_date_from
    and e.schedule_date <= p_date_to
    and e.owner_user_id = owner_id
    and e.organization_id in (select public.get_my_schedule_organization_ids())
  order by e.schedule_date, e.start_time;
end;
$$;

grant execute on function public.get_schedule_entries(date, date, uuid) to authenticated;

drop function if exists public.create_schedule_entry(text, uuid, date, time, time);

create function public.create_schedule_entry(
  p_name text,
  p_activity_id uuid default null,
  p_schedule_date date default current_date,
  p_start_time time default '08:00',
  p_end_time time default '09:00',
  p_owner_user_id uuid default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  org_id uuid;
  owner_id uuid := coalesce(p_owner_user_id, auth.uid());
  new_id uuid;
begin
  if auth.uid() is null then return null; end if;
  if nullif(trim(coalesce(p_name, '')), '') is null then return null; end if;
  if owner_id is null then return null; end if;
  if not public.can_edit_schedule_for(owner_id) then return null; end if;
  if p_end_time <= p_start_time then return null; end if;

  select organization_id into org_id
  from public.profiles
  where id = owner_id
  limit 1;

  if org_id is null then return null; end if;

  insert into admin.schedule_entries (
    organization_id, owner_user_id, name, activity_id, schedule_date, start_time, end_time
  )
  values (org_id, owner_id, trim(p_name), p_activity_id, p_schedule_date, p_start_time, p_end_time)
  returning id into new_id;

  return new_id;
end;
$$;

grant execute on function public.create_schedule_entry(text, uuid, date, time, time, uuid) to authenticated;

drop function if exists public.update_schedule_entry(uuid, text, uuid, date, time, time);

create function public.update_schedule_entry(
  p_id uuid,
  p_name text,
  p_activity_id uuid default null,
  p_schedule_date date default current_date,
  p_start_time time default '08:00',
  p_end_time time default '09:00'
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  owner_id uuid;
begin
  if auth.uid() is null then return false; end if;
  if nullif(trim(coalesce(p_name, '')), '') is null then return false; end if;
  if p_end_time <= p_start_time then return false; end if;

  select e.owner_user_id into owner_id
  from admin.schedule_entries e
  where e.id = p_id
    and e.organization_id in (select public.get_my_schedule_organization_ids())
  limit 1;

  if owner_id is null or not public.can_edit_schedule_for(owner_id) then return false; end if;

  update admin.schedule_entries
  set name = trim(p_name), activity_id = p_activity_id, schedule_date = p_schedule_date,
      start_time = p_start_time, end_time = p_end_time
  where id = p_id and owner_user_id = owner_id;

  return found;
end;
$$;

grant execute on function public.update_schedule_entry(uuid, text, uuid, date, time, time) to authenticated;

create or replace function public.delete_schedule_entry(p_id uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  owner_id uuid;
begin
  if auth.uid() is null then return false; end if;

  select e.owner_user_id into owner_id
  from admin.schedule_entries e
  where e.id = p_id
    and e.organization_id in (select public.get_my_schedule_organization_ids())
  limit 1;

  if owner_id is null or not public.can_edit_schedule_for(owner_id) then return false; end if;

  delete from admin.schedule_entries where id = p_id and owner_user_id = owner_id;
  return found;
end;
$$;

grant execute on function public.delete_schedule_entry(uuid) to authenticated;
