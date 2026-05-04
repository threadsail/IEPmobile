-- Ensures public.add_student matches the app (grade, classroom, goals).
-- Run if you see: "Could not find the function public.add_student(...p_classroom, p_grade...) in the schema cache"
-- Then: Supabase Dashboard → Settings → API → Reload schema cache.

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

grant execute on function public.add_student(text, text, text, text, text, text[]) to authenticated;
grant execute on function public.add_student(text, text, text, text, text, text[]) to service_role;
