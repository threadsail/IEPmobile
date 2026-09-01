-- Progress / observation log per student (Data tab).
-- Run once in Supabase Dashboard → SQL Editor:
--   https://supabase.com/dashboard/project/htrasouxjtbpqbcjuari/sql/new
--
-- Requires: admin.students (supabase-students.sql), auth.uid().
-- After running, if the app still cannot find the RPC, open
-- Project Settings → API → Reload schema cache.

create schema if not exists admin;

create table if not exists admin.student_progress_logs (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references admin.students (id) on delete cascade,
  user_id uuid not null,
  logged_on date not null,
  goal_index int,
  objective_index int,
  summary text not null,
  created_at timestamptz not null default now()
);

alter table admin.student_progress_logs
  add column if not exists objective_index int;

create index if not exists student_progress_logs_student_created
  on admin.student_progress_logs (student_id, created_at desc);

-- Drop any prior overload so PostgREST sees a single signature.
drop function if exists public.insert_student_progress_log(uuid, date, int, text);
drop function if exists public.insert_student_progress_log(uuid, date, integer, text);
drop function if exists public.insert_student_progress_log(uuid, date, int, int, text);

create or replace function public.insert_student_progress_log(
  p_student_id uuid,
  p_logged_on date,
  p_goal_index int,
  p_objective_index int,
  p_summary text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;

  if not exists (
    select 1
    from admin.students s
    where s.id = p_student_id and s.user_id = auth.uid()
  ) then
    raise exception 'student not found';
  end if;

  if p_summary is null or length(trim(p_summary)) = 0 then
    raise exception 'summary required';
  end if;

  insert into admin.student_progress_logs (
    student_id,
    user_id,
    logged_on,
    goal_index,
    objective_index,
    summary
  )
  values (
    p_student_id,
    auth.uid(),
    coalesce(p_logged_on, (timezone('utc', now()))::date),
    case when p_goal_index is null or p_goal_index < 0 then null else p_goal_index end,
    case
      when p_goal_index is null or p_goal_index < 0 then null
      when p_objective_index is null or p_objective_index < 0 then null
      else p_objective_index
    end,
    trim(p_summary)
  );
end;
$$;

grant execute on function public.insert_student_progress_log(uuid, date, int, int, text) to authenticated;
grant execute on function public.insert_student_progress_log(uuid, date, int, int, text) to service_role;

-- Read progress logs for a student (Data tab history).
drop function if exists public.get_student_progress_logs(uuid, int);

create or replace function public.get_student_progress_logs(
  p_student_id uuid,
  p_goal_index int default null
)
returns table (
  id uuid,
  student_id uuid,
  logged_on date,
  goal_index int,
  objective_index int,
  summary text,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = ''
stable
as $$
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;

  if not exists (
    select 1
    from admin.students s
    where s.id = p_student_id and s.user_id = auth.uid()
  ) then
    raise exception 'student not found';
  end if;

  return query
  select
    l.id,
    l.student_id,
    l.logged_on,
    l.goal_index,
    l.objective_index,
    l.summary,
    l.created_at
  from admin.student_progress_logs l
  where l.student_id = p_student_id
    and (
      p_goal_index is null
      or (p_goal_index < 0 and l.goal_index is null)
      or l.goal_index = p_goal_index
    )
  order by l.logged_on desc, l.created_at desc;
end;
$$;

grant execute on function public.get_student_progress_logs(uuid, int) to authenticated;
grant execute on function public.get_student_progress_logs(uuid, int) to service_role;

notify pgrst, 'reload schema';
