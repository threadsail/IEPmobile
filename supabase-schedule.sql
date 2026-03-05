-- Schedule entries per organization (visible to all users in the org).
-- Run in Supabase SQL Editor. Requires: admin.organization, public.profiles.organization_id.

create table if not exists admin.schedule_entries (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references admin.organization(id) on delete cascade,
  name text not null,
  activity_id uuid references admin.activities(id) on delete set null,
  schedule_date date not null,
  start_time time not null,
  end_time time not null,
  created_at timestamptz default now()
);

create index if not exists schedule_entries_org_date_idx on admin.schedule_entries(organization_id, schedule_date);

-- RPC: get schedule entries for current user's org in date range
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
  return query
  select e.id, e.organization_id, e.name, e.activity_id, e.schedule_date, e.start_time, e.end_time, e.created_at
  from admin.schedule_entries e
  join public.profiles p on p.organization_id = e.organization_id and p.id = auth.uid()
  where e.schedule_date >= p_date_from and e.schedule_date <= p_date_to
  order by e.schedule_date, e.start_time;
end;
$$;

grant execute on function public.get_schedule_entries(date, date) to authenticated;

-- RPC: create schedule entry (uses current user's org from profile)
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
  new_id uuid;
begin
  if auth.uid() is null then return null; end if;
  if nullif(trim(coalesce(p_name, '')), '') is null then return null; end if;
  select organization_id into org_id from public.profiles where id = auth.uid() limit 1;
  if org_id is null then return null; end if;
  if p_end_time <= p_start_time then return null; end if;
  insert into admin.schedule_entries (organization_id, name, activity_id, schedule_date, start_time, end_time)
  values (org_id, trim(p_name), p_activity_id, p_schedule_date, p_start_time, p_end_time)
  returning id into new_id;
  return new_id;
end;
$$;

grant execute on function public.create_schedule_entry(text, uuid, date, time, time) to authenticated;

-- RPC: update schedule entry (must belong to current user's org)
-- Required params first (no defaults), then optional (with defaults) - required by PostgreSQL.
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
begin
  if auth.uid() is null then return false; end if;
  if nullif(trim(coalesce(p_name, '')), '') is null then return false; end if;
  select organization_id into org_id from public.profiles where id = auth.uid() limit 1;
  if org_id is null then return false; end if;
  if p_end_time <= p_start_time then return false; end if;
  update admin.schedule_entries
  set name = trim(p_name), activity_id = p_activity_id, schedule_date = p_schedule_date, start_time = p_start_time, end_time = p_end_time
  where id = p_id and organization_id = org_id;
  return found;
end;
$$;

grant execute on function public.update_schedule_entry(uuid, text, uuid, date, time, time) to authenticated;

-- RPC: delete schedule entry (must belong to current user's org; only Teacher or Admin can delete)
-- If you get "Could not find the function in the schema cache", run this block then: Supabase Dashboard → Project Settings → API → Reload schema cache
create or replace function public.delete_schedule_entry(p_id uuid)
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
  select organization_id, role into org_id, user_role from public.profiles where id = auth.uid() limit 1;
  if org_id is null then return false; end if;
  if user_role is null or user_role not in ('Teacher', 'Admin') then return false; end if;
  delete from admin.schedule_entries where id = p_id and organization_id = org_id;
  return found;
end;
$$;

grant execute on function public.delete_schedule_entry(uuid) to authenticated;
