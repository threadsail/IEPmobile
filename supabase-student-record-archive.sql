-- Archive entire student records (hide from roster; restore later). Run in Supabase SQL Editor.
-- Requires: admin.students, public.get_my_students with goals + archived_goals (see supabase-student-goals-archived.sql).
-- After run: Project Settings → API → Reload schema cache.

alter table admin.students add column if not exists archived boolean not null default false;
alter table admin.students add column if not exists archived_at timestamptz;

create index if not exists students_user_archived_idx on admin.students (user_id, archived);

-- Active roster only (not archived)
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
    and not coalesce(s.archived, false)
  order by coalesce(s.first_name, ''), coalesce(s.last_name, '');
end;
$$;

grant execute on function public.get_my_students() to authenticated;
grant execute on function public.get_my_students() to service_role;

-- Archived roster (same columns; all rows have student-level archived = true)
drop function if exists public.get_my_archived_students();

create function public.get_my_archived_students()
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
  archived_goals text[],
  archived_at timestamptz
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
    ) as archived_goals,
    s.archived_at
  from admin.students s
  where s.user_id = auth.uid()
    and coalesce(s.archived, false) = true
  order by s.archived_at desc nulls last, coalesce(s.first_name, ''), coalesce(s.last_name, '');
end;
$$;

grant execute on function public.get_my_archived_students() to authenticated;
grant execute on function public.get_my_archived_students() to service_role;

-- Hide student + goals from active lists; data stays in DB for unarchive
create or replace function public.archive_student(p_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null or p_id is null then return; end if;
  update admin.students
  set
    archived = true,
    archived_at = now(),
    updated_at = now()
  where id = p_id
    and user_id = auth.uid()
    and not coalesce(archived, false);
end;
$$;

grant execute on function public.archive_student(uuid) to authenticated;
grant execute on function public.archive_student(uuid) to service_role;

create or replace function public.unarchive_student(p_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null or p_id is null then return; end if;
  update admin.students
  set
    archived = false,
    archived_at = null,
    updated_at = now()
  where id = p_id
    and user_id = auth.uid()
    and coalesce(archived, false) = true;
end;
$$;

grant execute on function public.unarchive_student(uuid) to authenticated;
grant execute on function public.unarchive_student(uuid) to service_role;

-- Do not allow profile edits while student is archived (unarchive first)
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

  if not exists (
    select 1 from admin.students s
    where s.id = p_id and s.user_id = auth.uid() and not coalesce(s.archived, false)
  ) then
    return;
  end if;

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
