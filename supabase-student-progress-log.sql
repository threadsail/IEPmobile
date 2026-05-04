-- Progress / observation log per student (Data tab). Run in Supabase SQL Editor.
-- Requires: admin.students, auth.uid().

create table if not exists admin.student_progress_logs (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references admin.students (id) on delete cascade,
  user_id uuid not null,
  logged_on date not null,
  goal_index int,
  summary text not null,
  created_at timestamptz not null default now()
);

create index if not exists student_progress_logs_student_created
  on admin.student_progress_logs (student_id, created_at desc);

drop function if exists public.insert_student_progress_log(uuid, date, int, text);

create or replace function public.insert_student_progress_log(
  p_student_id uuid,
  p_logged_on date,
  p_goal_index int,
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
  insert into admin.student_progress_logs (student_id, user_id, logged_on, goal_index, summary)
  values (
    p_student_id,
    auth.uid(),
    coalesce(p_logged_on, (timezone('utc', now()))::date),
    case when p_goal_index is null or p_goal_index < 0 then null else p_goal_index end,
    trim(p_summary)
  );
end;
$$;

grant execute on function public.insert_student_progress_log(uuid, date, int, text) to authenticated;
grant execute on function public.insert_student_progress_log(uuid, date, int, text) to service_role;
