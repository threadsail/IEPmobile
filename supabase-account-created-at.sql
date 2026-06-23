-- Account signup timestamp from auth.users (source of truth for "Account created" in the app).
create or replace function public.get_my_account_created_at()
returns timestamptz
language sql
security definer
stable
set search_path = ''
as $$
  select created_at from auth.users where id = auth.uid();
$$;

grant execute on function public.get_my_account_created_at() to authenticated;
grant execute on function public.get_my_account_created_at() to service_role;

notify pgrst, 'reload schema';
