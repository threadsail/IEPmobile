-- =============================================================================
-- OAuth + email signup parity: one profile setup for all auth.users inserts.
-- Run in Supabase SQL Editor after supabase-signup-fix.sql and
-- supabase-add-subscription-plan.sql.
--
-- Fixes Google/Microsoft users missing organization, admin.profiles, or names.
-- =============================================================================

create schema if not exists admin;

create table if not exists admin.organization (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  owner_id uuid references auth.users(id) on delete set null,
  created_at timestamptz default now()
);

create table if not exists admin.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text,
  first_name text,
  last_name text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table admin.profiles
  add column if not exists subscription_plan text default 'basic',
  add column if not exists subscription_interval text default 'monthly';

alter table public.profiles
  add column if not exists first_name text,
  add column if not exists last_name text,
  add column if not exists full_name text,
  add column if not exists role text,
  add column if not exists organization_id uuid references admin.organization(id),
  add column if not exists created_at timestamptz default now(),
  add column if not exists updated_at timestamptz default now();

-- Shared name/org parsing for email signup + Google/Microsoft OAuth metadata.
create or replace function public.profile_fields_from_auth_user(u auth.users)
returns table (
  username text,
  first_name text,
  last_name text,
  full_name text,
  organization_name text
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  meta jsonb := coalesce(u.raw_user_meta_data, '{}'::jsonb);
  meta_full text := nullif(trim(coalesce(meta->>'full_name', meta->>'name')), '');
  meta_given text := nullif(trim(meta->>'given_name'), '');
  meta_family text := nullif(trim(meta->>'family_name'), '');
  fname text := nullif(trim(meta->>'first_name'), '');
  lname text := nullif(trim(meta->>'last_name'), '');
  ffull text;
  uname text;
  oname text;
begin
  if fname is null and meta_given is not null then
    fname := meta_given;
  end if;
  if lname is null and meta_family is not null then
    lname := meta_family;
  end if;
  if fname is null and lname is null and meta_full is not null then
    fname := split_part(meta_full, ' ', 1);
    if strpos(meta_full, ' ') > 0 then
      lname := trim(substr(meta_full, strpos(meta_full, ' ') + 1));
    end if;
  end if;

  ffull := nullif(trim(coalesce(fname, '') || ' ' || coalesce(lname, '')), '');
  if ffull is null and meta_full is not null then
    ffull := meta_full;
  end if;

  uname := coalesce(
    nullif(trim(meta->>'username'), ''),
    nullif(trim(split_part(coalesce(u.email, ''), '@', 1)), ''),
    'user_' || replace(u.id::text, '-', '')
  );
  oname := coalesce(nullif(trim(meta->>'organization_name'), ''), 'My Organization');

  return query select uname, coalesce(fname, ''), coalesce(lname, ''), coalesce(ffull, ''), oname;
end;
$$;

create or replace function public.ensure_user_profile_setup()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := auth.uid();
  u auth.users%rowtype;
  pf record;
  org_id uuid;
begin
  if uid is null then
    return;
  end if;

  select * into u from auth.users where id = uid;
  if not found then
    return;
  end if;

  select * into pf from public.profile_fields_from_auth_user(u);

  select p.organization_id into org_id from public.profiles p where p.id = uid;
  if org_id is null then
    insert into admin.organization (name, owner_id)
    values (pf.organization_name, uid)
    returning id into org_id;
  end if;

  insert into public.profiles (id, username, first_name, last_name, full_name, role, organization_id, created_at)
  values (uid, pf.username, pf.first_name, pf.last_name, pf.full_name, 'Teacher', org_id, u.created_at)
  on conflict (id) do update set
    username = case
      when coalesce(public.profiles.username, '') ~ '^user_[0-9a-f]{8,}$' then excluded.username
      when coalesce(public.profiles.username, '') = '' then excluded.username
      else public.profiles.username
    end,
    first_name = case when coalesce(public.profiles.first_name, '') = '' then excluded.first_name else public.profiles.first_name end,
    last_name = case when coalesce(public.profiles.last_name, '') = '' then excluded.last_name else public.profiles.last_name end,
    full_name = case when coalesce(public.profiles.full_name, '') = '' then excluded.full_name else public.profiles.full_name end,
    role = coalesce(public.profiles.role, excluded.role),
    organization_id = coalesce(public.profiles.organization_id, excluded.organization_id),
    updated_at = now();

  insert into admin.profiles (
    id,
    role,
    first_name,
    last_name,
    subscription_plan,
    subscription_interval,
    created_at,
    updated_at
  )
  values (uid, 'Teacher', pf.first_name, pf.last_name, 'basic', 'monthly', now(), now())
  on conflict (id) do update set
    first_name = case when coalesce(admin.profiles.first_name, '') = '' then excluded.first_name else admin.profiles.first_name end,
    last_name = case when coalesce(admin.profiles.last_name, '') = '' then excluded.last_name else admin.profiles.last_name end,
    role = coalesce(admin.profiles.role, excluded.role),
    subscription_plan = coalesce(admin.profiles.subscription_plan, excluded.subscription_plan),
    subscription_interval = coalesce(admin.profiles.subscription_interval, excluded.subscription_interval),
    updated_at = now();
end;
$$;

grant execute on function public.ensure_user_profile_setup() to authenticated;
grant execute on function public.ensure_user_profile_setup() to service_role;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  pf record;
  org_id uuid;
begin
  select * into pf from public.profile_fields_from_auth_user(new);

  insert into admin.organization (name, owner_id)
  values (pf.organization_name, new.id)
  returning id into org_id;

  insert into public.profiles (id, username, first_name, last_name, full_name, role, organization_id, created_at)
  values (new.id, pf.username, pf.first_name, pf.last_name, pf.full_name, 'Teacher', org_id, new.created_at);

  insert into admin.profiles (
    id,
    role,
    first_name,
    last_name,
    subscription_plan,
    subscription_interval,
    created_at,
    updated_at
  )
  values (new.id, 'Teacher', pf.first_name, pf.last_name, 'basic', 'monthly', now(), now());

  return new;
exception
  when others then
    perform public.ensure_user_profile_setup_from_user(new);
    return new;
end;
$$;

-- Helper for trigger exception path and backfill (explicit user row, no JWT).
create or replace function public.ensure_user_profile_setup_from_user(u auth.users)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  pf record;
  org_id uuid;
begin
  select * into pf from public.profile_fields_from_auth_user(u);

  select p.organization_id into org_id from public.profiles p where p.id = u.id;
  if org_id is null then
    insert into admin.organization (name, owner_id)
    values (pf.organization_name, u.id)
    returning id into org_id;
  end if;

  insert into public.profiles (id, username, first_name, last_name, full_name, role, organization_id, created_at)
  values (u.id, pf.username, pf.first_name, pf.last_name, pf.full_name, 'Teacher', org_id, u.created_at)
  on conflict (id) do update set
    first_name = case when coalesce(public.profiles.first_name, '') = '' then excluded.first_name else public.profiles.first_name end,
    last_name = case when coalesce(public.profiles.last_name, '') = '' then excluded.last_name else public.profiles.last_name end,
    full_name = case when coalesce(public.profiles.full_name, '') = '' then excluded.full_name else public.profiles.full_name end,
    role = coalesce(public.profiles.role, excluded.role),
    organization_id = coalesce(public.profiles.organization_id, excluded.organization_id),
    updated_at = now();

  insert into admin.profiles (
    id,
    role,
    first_name,
    last_name,
    subscription_plan,
    subscription_interval,
    created_at,
    updated_at
  )
  values (u.id, 'Teacher', pf.first_name, pf.last_name, 'basic', 'monthly', now(), now())
  on conflict (id) do update set
    first_name = case when coalesce(admin.profiles.first_name, '') = '' then excluded.first_name else admin.profiles.first_name end,
    last_name = case when coalesce(admin.profiles.last_name, '') = '' then excluded.last_name else admin.profiles.last_name end,
    role = coalesce(admin.profiles.role, excluded.role),
    subscription_plan = coalesce(admin.profiles.subscription_plan, excluded.subscription_plan),
    subscription_interval = coalesce(admin.profiles.subscription_interval, excluded.subscription_interval),
    updated_at = now();
end;
$$;

grant execute on function public.ensure_user_profile_setup_from_user(auth.users) to service_role;
revoke all on function public.profile_fields_from_auth_user(auth.users) from public;
grant execute on function public.profile_fields_from_auth_user(auth.users) to service_role;

-- Service-role entry point for OAuth callback / dashboard bootstrap (no JWT required).
create or replace function public.ensure_user_profile_setup_by_id(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  u auth.users%rowtype;
begin
  if p_user_id is null then
    return;
  end if;

  select * into u from auth.users where id = p_user_id;
  if not found then
    return;
  end if;

  perform public.ensure_user_profile_setup_from_user(u);
end;
$$;

grant execute on function public.ensure_user_profile_setup_by_id(uuid) to service_role;
revoke all on function public.ensure_user_profile_setup_by_id(uuid) from public;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Backfill users missing organization or profile rows (email + OAuth).
do $$
declare
  u auth.users%rowtype;
begin
  for u in
    select au.*
    from auth.users au
    left join public.profiles pp on pp.id = au.id
    left join admin.profiles ap on ap.id = au.id
    where pp.id is null
       or ap.id is null
       or pp.organization_id is null
       or (
         coalesce(pp.first_name, '') = ''
         and coalesce(
           au.raw_user_meta_data->>'given_name',
           au.raw_user_meta_data->>'full_name',
           au.raw_user_meta_data->>'name',
           ''
         ) <> ''
       )
  loop
    perform public.ensure_user_profile_setup_from_user(u);
  end loop;
end;
$$;

notify pgrst, 'reload schema';
