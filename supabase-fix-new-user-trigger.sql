-- Fix "Database error saving new user": update handle_new_user so new profile rows
-- include first_name, last_name, full_name from signup metadata and set role to an
-- allowed value. Allowed roles: Teacher, Aide, Admin. New signups get 'Teacher'.
-- Run in Supabase SQL Editor.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
declare
  fname text := nullif(trim(new.raw_user_meta_data->>'first_name'), '');
  lname text := nullif(trim(new.raw_user_meta_data->>'last_name'), '');
  uname text := coalesce(nullif(trim(new.raw_user_meta_data->>'username'), ''), 'user_' || substr(new.id::text, 1, 8));
  ffull text := nullif(trim(coalesce(fname, '') || ' ' || coalesce(lname, '')), '');
begin
  insert into public.profiles (id, username, first_name, last_name, full_name, role)
  values (
    new.id,
    uname,
    fname,
    lname,
    ffull,
    'Teacher'
  );
  return new;
end;
$$;
