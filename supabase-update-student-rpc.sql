-- Create or replace public.update_student so it appears in the schema cache.
-- Run this in Supabase SQL Editor, then reload schema cache if needed:
-- Dashboard → Project Settings → API → "Reload schema cache" (or restart project).

drop function if exists public.update_student(uuid, text, text, text, text, text, text[]);

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

grant execute on function public.update_student(uuid, text, text, text, text, text, text[]) to authenticated;
grant execute on function public.update_student(uuid, text, text, text, text, text, text[]) to service_role;
