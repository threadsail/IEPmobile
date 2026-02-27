-- Add archived support for IEP goals. Run ENTIRE file in Supabase SQL Editor.
-- After running: Project Settings → API → Reload schema cache (if archive still doesn't move goals).
-- 1. Adds archived/archived_at to admin.student_goals
-- 2. get_my_students returns goals + archived_goals
-- 3. New RPC archive_student_goal_by_index marks one goal as archived
-- 4. update_student only deletes non-archived goals so archived rows stay

-- 1. Columns on student_goals
alter table admin.student_goals add column if not exists archived boolean not null default false;
alter table admin.student_goals add column if not exists archived_at timestamptz;

-- 2. get_my_students: return goals (active) and archived_goals
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
  goals text[],
  archived_goals text[]
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
       where g.student_id = s.id and (g.archived = false or g.archived is null)),
      array[]::text[]
    ) as goals,
    coalesce(
      (select array_agg(g.goal order by g.archived_at desc nulls last)
       from admin.student_goals g
       where g.student_id = s.id and g.archived = true),
      array[]::text[]
    ) as archived_goals
  from admin.students s
  where s.user_id = auth.uid()
  order by coalesce(s.first_name, ''), coalesce(s.last_name, '');
end;
$$;

grant execute on function public.get_my_students() to authenticated;
grant execute on function public.get_my_students() to service_role;

-- 3. Archive one goal by its index (among non-archived goals for that student)
create or replace function public.archive_student_goal_by_index(
  p_student_id uuid,
  p_goal_index int
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  goal_id_val uuid;
begin
  if auth.uid() is null or p_student_id is null then return; end if;
  if p_goal_index is null or p_goal_index < 0 then return; end if;
  select g.id into goal_id_val
  from admin.student_goals g
  join admin.students s on s.id = g.student_id and s.user_id = auth.uid()
  where g.student_id = p_student_id and (g.archived = false or g.archived is null)
  order by g.sort_order
  limit 1 offset p_goal_index;
  if goal_id_val is not null then
    update admin.student_goals
    set archived = true, archived_at = now()
    where id = goal_id_val;
  end if;
end;
$$;

grant execute on function public.archive_student_goal_by_index(uuid, int) to authenticated;
grant execute on function public.archive_student_goal_by_index(uuid, int) to service_role;

-- 3b. Unarchive one goal by its index (among archived goals for that student)
create or replace function public.unarchive_student_goal_by_index(
  p_student_id uuid,
  p_archived_goal_index int
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  goal_id_val uuid;
  next_sort_order int;
begin
  if auth.uid() is null or p_student_id is null then return; end if;
  if p_archived_goal_index is null or p_archived_goal_index < 0 then return; end if;
  select g.id into goal_id_val
  from admin.student_goals g
  join admin.students s on s.id = g.student_id and s.user_id = auth.uid()
  where g.student_id = p_student_id and g.archived = true
  order by g.archived_at desc nulls last
  limit 1 offset p_archived_goal_index;
  if goal_id_val is not null then
    select coalesce(max(g2.sort_order), -1) + 1 into next_sort_order
    from admin.student_goals g2
    where g2.student_id = p_student_id and (g2.archived = false or g2.archived is null);
    update admin.student_goals
    set archived = false, archived_at = null, sort_order = next_sort_order
    where id = goal_id_val;
  end if;
end;
$$;

grant execute on function public.unarchive_student_goal_by_index(uuid, int) to authenticated;
grant execute on function public.unarchive_student_goal_by_index(uuid, int) to service_role;

-- 4. update_student: only delete non-archived goals, then insert new ones
drop function if exists public.update_student(uuid, text, text, text, text, text, text[]);

create function public.update_student(
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
  delete from admin.student_goals
  where student_id = p_id and (archived = false or archived is null);
  foreach g in array p_goals
  loop
    if nullif(trim(g), '') is not null then
      insert into admin.student_goals (student_id, goal, sort_order) values (p_id, trim(g), idx);
      idx := idx + 1;
    end if;
  end loop;
end;
$$;

grant execute on function public.update_student(uuid, text, text, text, text, text, text[]) to authenticated;
grant execute on function public.update_student(uuid, text, text, text, text, text, text[]) to service_role;
