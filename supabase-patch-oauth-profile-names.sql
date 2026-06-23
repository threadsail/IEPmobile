-- =============================================================================
-- Patch: map Google/Microsoft OAuth names into public.profiles on signup.
-- Prefer running supabase-oauth-user-parity.sql instead — it includes this
-- name mapping plus admin.profiles, organization, and backfill for OAuth users.
-- =============================================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  meta_full text := nullif(trim(coalesce(
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'name'
  )), '');
  meta_given text := nullif(trim(new.raw_user_meta_data->>'given_name'), '');
  meta_family text := nullif(trim(new.raw_user_meta_data->>'family_name'), '');
  fname text := nullif(trim(new.raw_user_meta_data->>'first_name'), '');
  lname text := nullif(trim(new.raw_user_meta_data->>'last_name'), '');
  ffull text;
  uname text := coalesce(nullif(trim(new.raw_user_meta_data->>'username'), ''), 'user_' || replace(new.id::text, '-', ''));
  org_name text := coalesce(nullif(trim(new.raw_user_meta_data->>'organization_name'), ''), 'My Organization');
  org_id uuid;
begin
  if fname is null and meta_given is not null then
    fname := meta_given;
  end if;
  if lname is null and meta_family is not null then
    lname := meta_family;
  end if;
  if fname is null and lname is null and meta_full is not null then
    fname := split_part(meta_full, ' ', 1);
    if strpos(meta_full, ' ') > 0 then
      lname := trim(substr(meta_full, strpos(meta_full, ' ') + 1));
    end if;
  end if;

  ffull := nullif(trim(coalesce(fname, '') || ' ' || coalesce(lname, '')), '');
  if ffull is null and meta_full is not null then
    ffull := meta_full;
  end if;

  insert into admin.organization (name, owner_id) values (org_name, new.id) returning id into org_id;
  insert into public.profiles (id, username, first_name, last_name, full_name, role, organization_id)
  values (new.id, uname, coalesce(fname, ''), coalesce(lname, ''), coalesce(ffull, ''), 'Teacher', org_id);
  return new;
exception
  when others then
    if org_id is null then
      insert into admin.organization (name, owner_id) values (org_name, new.id) returning id into org_id;
    end if;
    insert into public.profiles (id, username, first_name, last_name, full_name, role, organization_id)
    values (new.id, 'user_' || replace(new.id::text, '-', ''), coalesce(fname, ''), coalesce(lname, ''), coalesce(ffull, ''), 'Teacher', org_id);
  return new;
end;
$$;
