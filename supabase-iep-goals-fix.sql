-- Run this entire file in Supabase SQL Editor to fix IEP goals not showing.
-- Ensures admin.student_goals exists and get_my_students returns a "goals" column.

-- 1. Schema and goals table (required for goals to be stored)
create schema if not exists admin;

create table if not exists admin.student_goals (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references admin.students(id) on delete cascade,
  goal text not null,
  sort_order integer not null default 0,
  created_at timestamptz default now()
);

create index if not exists student_goals_student_id_idx on admin.student_goals(student_id);

-- 2. Replace get_my_students so it returns goals (required for goals to display)
-- Drop first in case the existing one has a different return type (e.g. setof admin.students).
drop function if exists public.get_my_students();

create function public.get_my_students()
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
      (select array_agg(g.goal order by g.sort_order)
       from admin.student_goals g
       where g.student_id = s.id),
      array[]::text[]
    ) as goals
  from admin.students s
  where s.user_id = auth.uid()
  order by coalesce(s.first_name, ''), coalesce(s.last_name, '');
end;
$$;

grant execute on function public.get_my_students() to authenticated;
grant execute on function public.get_my_students() to service_role;
