-- =============================================================================
-- Sign-up & profile setup: run in Supabase SQL Editor (Dashboard → SQL Editor).
-- Fixes new-user trigger, public.profiles columns, admin.organization, and RPCs.
-- If sign-up fails, check Dashboard → Logs → Postgres for the trigger error.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Admin schema & organization table
-- -----------------------------------------------------------------------------
create schema if not exists admin;

create table if not exists admin.organization (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  owner_id uuid references auth.users(id) on delete set null,
  created_at timestamptz default now()
);

alter table admin.organization enable row level security;
alter table admin.organization add column if not exists owner_id uuid references auth.users(id) on delete set null;

drop policy if exists "Users can read own or member organization" on admin.organization;
create policy "Users can read own or member organization"
  on admin.organization for select
  using (
    owner_id = auth.uid()
    or id in (select organization_id from public.profiles where id = auth.uid() and organization_id is not null)
  );

drop policy if exists "Owners can update own organization" on admin.organization;
create policy "Owners can update own organization"
  on admin.organization for update
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

-- -----------------------------------------------------------------------------
-- 2. Public profiles: columns and role constraint
-- -----------------------------------------------------------------------------
alter table public.profiles
  add column if not exists first_name text,
  add column if not exists last_name text,
  add column if not exists full_name text,
  add column if not exists role text,
  add column if not exists organization_id uuid references admin.organization(id);

update public.profiles set role = 'Teacher' where role = 'teacher';
update public.profiles set role = 'Aide' where role = 'aide';
update public.profiles set role = 'Admin' where role = 'admin';

alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles add constraint profiles_role_check
  check (role is null or role in ('Teacher', 'Aide', 'Admin'));

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
  when duplicate_object then null;
end
$$;

-- -----------------------------------------------------------------------------
-- 3. New-user trigger (auth.users → organization + profile)
-- -----------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  fname text := nullif(trim(new.raw_user_meta_data->>'first_name'), '');
  lname text := nullif(trim(new.raw_user_meta_data->>'last_name'), '');
  uname text := coalesce(nullif(trim(new.raw_user_meta_data->>'username'), ''), 'user_' || replace(new.id::text, '-', ''));
  ffull text := nullif(trim(coalesce(fname, '') || ' ' || coalesce(lname, '')), '');
  org_name text := coalesce(nullif(trim(new.raw_user_meta_data->>'organization_name'), ''), 'My Organization');
  org_id uuid;
begin
  insert into admin.organization (name, owner_id) values (org_name, new.id) returning id into org_id;
  insert into public.profiles (id, username, first_name, last_name, full_name, role, organization_id)
  values (new.id, uname, coalesce(fname, ''), coalesce(lname, ''), coalesce(ffull, ''), 'Teacher', org_id);
  return new;
exception
  when others then
    if org_id is null then
      insert into admin.organization (name, owner_id) values (org_name, new.id) returning id into org_id;
    end if;
    insert into public.profiles (id, username, first_name, last_name, full_name, role, organization_id)
    values (new.id, 'user_' || replace(new.id::text, '-', ''), coalesce(fname, ''), coalesce(lname, ''), coalesce(ffull, ''), 'Teacher', org_id);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- -----------------------------------------------------------------------------
-- 4. RPCs: organization name (profile page & edit)
-- -----------------------------------------------------------------------------
create or replace function public.get_my_organization_name()
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  org_name text;
begin
  select o.name into org_name
  from public.profiles p
  join admin.organization o on o.id = p.organization_id
  where p.id = auth.uid()
  limit 1;
  return org_name;
end;
$$;

create or replace function public.update_my_organization_name(new_name text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  update admin.organization o
  set name = nullif(trim(new_name), '')
  from public.profiles p
  where p.id = auth.uid() and p.organization_id = o.id and o.owner_id = auth.uid();
end;
$$;

-- -----------------------------------------------------------------------------
-- 5. RPC: update profile (first name, last name, role)
-- -----------------------------------------------------------------------------
create or replace function public.update_my_profile(
  p_first_name text default null,
  p_last_name text default null,
  p_role text default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then return; end if;
  update public.profiles
  set
    first_name = nullif(trim(coalesce(p_first_name, '')), ''),
    last_name = nullif(trim(coalesce(p_last_name, '')), ''),
    role = case
      when p_role in ('Teacher', 'Aide', 'Admin') then p_role
      else (select role from public.profiles where id = auth.uid())
    end
  where id = auth.uid();
end;
$$;
