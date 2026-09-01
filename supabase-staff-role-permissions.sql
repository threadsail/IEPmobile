-- Staff role parity: Teacher and Admin (school administrator) share the same permissions.
-- Admin is not a super-admin tier — both roles manage the org account equally.
-- Run in Supabase SQL Editor after supabase-schedule-per-person.sql (or ensure helpers exist below).

create schema if not exists admin;

create table if not exists admin.teacher_aide_links (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references auth.users(id) on delete cascade,
  aide_id uuid not null references auth.users(id) on delete cascade,
  organization_id uuid not null references admin.organization(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (teacher_id, aide_id),
  check (teacher_id <> aide_id)
);

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

create or replace function public.get_schedule_roster()
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
