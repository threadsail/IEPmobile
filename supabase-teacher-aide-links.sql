-- Teacher–aide linking: aides join a teacher's organization and can view org schedules.
-- Run in Supabase SQL Editor after supabase-signup-fix.sql and supabase-schedule.sql.

create schema if not exists admin;

-- -----------------------------------------------------------------------------
-- 1. Teacher–aide links
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

-- -----------------------------------------------------------------------------
-- 2. Organization invite codes (teachers share with aides)
-- -----------------------------------------------------------------------------
alter table admin.organization add column if not exists invite_code text;

create unique index if not exists organization_invite_code_idx
  on admin.organization(invite_code)
  where invite_code is not null;

update admin.organization
set invite_code = replace(gen_random_uuid()::text, '-', '')
where invite_code is null;

-- -----------------------------------------------------------------------------
-- 3. Helper: org ids the current user may read schedules for
-- -----------------------------------------------------------------------------
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
-- 4. Schedule RPCs: org members + linked aides can read; only Teacher/Admin write
-- -----------------------------------------------------------------------------
create or replace function public.get_schedule_entries(
  p_date_from date,
  p_date_to date
)
returns table (
  id uuid,
  organization_id uuid,
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
begin
  if auth.uid() is null then return; end if;

  return query
  select e.id, e.organization_id, e.name, e.activity_id, e.schedule_date, e.start_time, e.end_time, e.created_at
  from admin.schedule_entries e
  where e.schedule_date >= p_date_from
    and e.schedule_date <= p_date_to
    and e.organization_id in (select public.get_my_schedule_organization_ids())
  order by e.schedule_date, e.start_time;
end;
$$;

grant execute on function public.get_schedule_entries(date, date) to authenticated;

create or replace function public.create_schedule_entry(
  p_name text,
  p_activity_id uuid default null,
  p_schedule_date date default current_date,
  p_start_time time default '08:00',
  p_end_time time default '09:00'
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  org_id uuid;
  user_role text;
  new_id uuid;
begin
  if auth.uid() is null then return null; end if;
  if nullif(trim(coalesce(p_name, '')), '') is null then return null; end if;

  select organization_id, role into org_id, user_role
  from public.profiles where id = auth.uid() limit 1;

  if org_id is null then return null; end if;
  if user_role is null or user_role not in ('Teacher', 'Admin') then return null; end if;
  if p_end_time <= p_start_time then return null; end if;

  insert into admin.schedule_entries (organization_id, name, activity_id, schedule_date, start_time, end_time)
  values (org_id, trim(p_name), p_activity_id, p_schedule_date, p_start_time, p_end_time)
  returning id into new_id;

  return new_id;
end;
$$;

grant execute on function public.create_schedule_entry(text, uuid, date, time, time) to authenticated;

create or replace function public.update_schedule_entry(
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
  org_id uuid;
  user_role text;
begin
  if auth.uid() is null then return false; end if;
  if nullif(trim(coalesce(p_name, '')), '') is null then return false; end if;

  select organization_id, role into org_id, user_role
  from public.profiles where id = auth.uid() limit 1;

  if org_id is null then return false; end if;
  if user_role is null or user_role not in ('Teacher', 'Admin') then return false; end if;
  if p_end_time <= p_start_time then return false; end if;

  update admin.schedule_entries
  set name = trim(p_name), activity_id = p_activity_id, schedule_date = p_schedule_date,
      start_time = p_start_time, end_time = p_end_time
  where id = p_id and organization_id = org_id;

  return found;
end;
$$;

grant execute on function public.update_schedule_entry(uuid, text, uuid, date, time, time) to authenticated;

-- -----------------------------------------------------------------------------
-- 5. Invite / join RPCs
-- -----------------------------------------------------------------------------
create or replace function public.get_my_organization_invite_code()
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  org_id uuid;
  user_role text;
  code text;
begin
  if auth.uid() is null then return null; end if;

  select organization_id, role into org_id, user_role
  from public.profiles where id = auth.uid() limit 1;

  if org_id is null then return null; end if;
  if user_role is null or user_role not in ('Teacher', 'Admin') then return null; end if;

  select invite_code into code from admin.organization where id = org_id limit 1;

  if code is null then
    code := replace(gen_random_uuid()::text, '-', '');
    update admin.organization set invite_code = code where id = org_id;
  end if;

  return code;
end;
$$;

grant execute on function public.get_my_organization_invite_code() to authenticated;

create or replace function public.join_organization_as_aide(p_invite_code text)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  org_id uuid;
  teacher_user_id uuid;
  normalized_code text := nullif(lower(trim(coalesce(p_invite_code, ''))), '');
begin
  if auth.uid() is null or normalized_code is null then return false; end if;

  select o.id, o.owner_id into org_id, teacher_user_id
  from admin.organization o
  where lower(o.invite_code) = normalized_code
  limit 1;

  if org_id is null or teacher_user_id is null then return false; end if;

  update public.profiles
  set organization_id = org_id, role = 'Aide'
  where id = auth.uid();

  insert into admin.teacher_aide_links (teacher_id, aide_id, organization_id)
  values (teacher_user_id, auth.uid(), org_id)
  on conflict (teacher_id, aide_id) do update set organization_id = excluded.organization_id;

  return true;
end;
$$;

grant execute on function public.join_organization_as_aide(text) to authenticated;

create or replace function public.count_my_organization_aides()
returns integer
language sql
security definer
stable
set search_path = ''
as $$
  select count(*)::integer
  from public.profiles p_me
  join public.profiles p_aide on p_aide.organization_id = p_me.organization_id and p_aide.role = 'Aide'
  where p_me.id = auth.uid() and p_me.organization_id is not null;
$$;

grant execute on function public.count_my_organization_aides() to authenticated;
