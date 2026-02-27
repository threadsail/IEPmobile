-- Students in admin schema. Access via RPCs only (no direct client access to admin).
-- Run in Supabase SQL Editor. Run after admin schema exists (e.g. supabase-signup-fix.sql).

create schema if not exists admin;

create table if not exists admin.students (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  first_name text,
  last_name text,
  note text,
  grade text,
  classroom text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- If the table already existed (e.g. from an older migration), add missing columns.
alter table admin.students add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table admin.students add column if not exists first_name text;
alter table admin.students add column if not exists last_name text;
alter table admin.students add column if not exists name text;
alter table admin.students add column if not exists note text;
alter table admin.students add column if not exists grade text;
alter table admin.students add column if not exists classroom text;
alter table admin.students add column if not exists created_at timestamptz default now();
alter table admin.students add column if not exists updated_at timestamptz default now();

create index if not exists students_user_id_idx on admin.students(user_id);

-- IEP goals: one row per goal per student
create table if not exists admin.student_goals (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references admin.students(id) on delete cascade,
  goal text not null,
  sort_order integer not null default 0,
  created_at timestamptz default now()
);

create index if not exists student_goals_student_id_idx on admin.student_goals(student_id);

-- -----------------------------------------------------------------------------
-- RPC: list current user's students (with grade, classroom, goals array)
-- -----------------------------------------------------------------------------
create or replace function public.get_my_students()
returns table (
  id uuid,
  user_id uuid,
  first_name text,
  last_name text,
  note text,
  grade text,
  classroom text,
  created_at timestamptz,
  updated_at timestamptz,
  goals text[]
)
language plpgsql
security definer
set search_path = ''
as $$
begin
  return query
  select
    s.id,
    s.user_id,
    s.first_name,
    s.last_name,
    s.note,
    s.grade,
    s.classroom,
    s.created_at,
    s.updated_at,
    coalesce(
      (select array_agg(g.goal order by g.sort_order) from admin.student_goals g where g.student_id = s.id),
      array[]::text[]
    ) as goals
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
  p_note text default null,
  p_grade text default null,
  p_classroom text default null,
  p_goals text[] default '{}'
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  new_id uuid;
  g text;
  idx int := 0;
begin
  if auth.uid() is null then return null; end if;
  if nullif(trim(coalesce(p_first_name, '')), '') is null and nullif(trim(coalesce(p_last_name, '')), '') is null then return null; end if;
  insert into admin.students (user_id, first_name, last_name, note, grade, classroom)
  values (
    auth.uid(),
    nullif(trim(coalesce(p_first_name, '')), ''),
    nullif(trim(coalesce(p_last_name, '')), ''),
    nullif(trim(coalesce(p_note, '')), ''),
    nullif(trim(coalesce(p_grade, '')), ''),
    nullif(trim(coalesce(p_classroom, '')), '')
  )
  returning id into new_id;
  foreach g in array p_goals
  loop
    if nullif(trim(g), '') is not null then
      insert into admin.student_goals (student_id, goal, sort_order) values (new_id, trim(g), idx);
      idx := idx + 1;
    end if;
  end loop;
  return new_id;
end;
$$;

-- -----------------------------------------------------------------------------
-- RPC: update student (called from dashboard/students edit)
-- -----------------------------------------------------------------------------
create or replace function public.update_student(
  p_id uuid,
  p_first_name text,
  p_last_name text default null,
  p_note text default null,
  p_grade text default null,
  p_classroom text default null,
  p_goals text[] default '{}'
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  g text;
  idx int := 0;
begin
  if auth.uid() is null then return; end if;
  if p_id is null then return; end if;
  if nullif(trim(coalesce(p_first_name, '')), '') is null and nullif(trim(coalesce(p_last_name, '')), '') is null then return; end if;
  update admin.students
  set
    first_name = nullif(trim(coalesce(p_first_name, '')), ''),
    last_name = nullif(trim(coalesce(p_last_name, '')), ''),
    note = nullif(trim(coalesce(p_note, '')), ''),
    grade = nullif(trim(coalesce(p_grade, '')), ''),
    classroom = nullif(trim(coalesce(p_classroom, '')), ''),
    updated_at = now()
  where id = p_id and user_id = auth.uid();
  delete from admin.student_goals where student_id = p_id;
  foreach g in array p_goals
  loop
    if nullif(trim(g), '') is not null then
      insert into admin.student_goals (student_id, goal, sort_order) values (p_id, trim(g), idx);
      idx := idx + 1;
    end if;
  end loop;
end;
$$;
