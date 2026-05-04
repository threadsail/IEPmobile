-- Permanently remove a student owned by the current user (goals cascade via FK).
-- Run in Supabase SQL Editor. After run: Settings → API → Reload schema cache.

create or replace function public.delete_student(p_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null or p_id is null then return; end if;
  delete from admin.students
  where id = p_id
    and user_id = auth.uid();
end;
$$;

grant execute on function public.delete_student(uuid) to authenticated;
grant execute on function public.delete_student(uuid) to service_role;
