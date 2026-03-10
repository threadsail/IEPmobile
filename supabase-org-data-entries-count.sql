-- Run in Supabase SQL Editor. Requires: public.profiles (organization_id), admin.students, public.applied_student_data.
-- If applied_student_data does not exist yet, create it first (e.g. with id, student_id, status, etc.) or this RPC will fail.

create or replace function public.get_my_org_data_entries_count()
returns bigint
language plpgsql
security definer
set search_path = ''
as $$
declare
  org_id uuid;
  result bigint;
begin
  if auth.uid() is null then return 0; end if;
  select organization_id into org_id from public.profiles where id = auth.uid() limit 1;
  if org_id is null then return 0; end if;

  select count(*) into result
  from public.applied_student_data d
  join admin.students s on s.id = d.student_id
  join public.profiles p on p.id = s.user_id
  where p.organization_id = org_id;

  return coalesce(result, 0);
end;
$$;
