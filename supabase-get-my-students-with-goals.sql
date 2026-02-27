-- Fix: IEP goals not displaying. Recreate get_my_students to return goals from admin.student_goals.
-- Run in Supabase SQL Editor. Requires: admin.students, admin.student_goals.

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
