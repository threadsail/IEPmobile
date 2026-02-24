-- Students in admin schema. Access via RPCs only (no direct client access to admin).
-- Run in Supabase SQL Editor. Run after admin schema exists (e.g. supabase-signup-fix.sql).

create schema if not exists admin;

create table if not exists admin.students (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  first_name text,
  last_name text,
  note text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- If the table already existed (e.g. from an older migration), add missing columns.
alter table admin.students add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table admin.students add column if not exists first_name text;
alter table admin.students add column if not exists last_name text;
alter table admin.students add column if not exists name text;
alter table admin.students add column if not exists note text;
alter table admin.students add column if not exists created_at timestamptz default now();
alter table admin.students add column if not exists updated_at timestamptz default now();

create index if not exists students_user_id_idx on admin.students(user_id);

-- -----------------------------------------------------------------------------
-- RPC: list current user's students
-- -----------------------------------------------------------------------------
create or replace function public.get_my_students()
returns setof admin.students
language plpgsql
security definer
set search_path = ''
as $$
begin
  return query
  select s.*
  from admin.students s
  where s.user_id = auth.uid()
  order by coalesce(s.first_name, ''), coalesce(s.last_name, '');
end;
$$;

-- -----------------------------------------------------------------------------
-- RPC: add student (called from dashboard/students/actions)
-- -----------------------------------------------------------------------------
create or replace function public.add_student(
  p_first_name text,
  p_last_name text default null,
  p_note text default null
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
  if nullif(trim(coalesce(p_first_name, '')), '') is null and nullif(trim(coalesce(p_last_name, '')), '') is null then return null; end if;
  insert into admin.students (user_id, first_name, last_name, note)
  values (
    auth.uid(),
    nullif(trim(coalesce(p_first_name, '')), ''),
    nullif(trim(coalesce(p_last_name, '')), ''),
    nullif(trim(coalesce(p_note, '')), '')
  )
  returning id into new_id;
  return new_id;
end;
$$;
