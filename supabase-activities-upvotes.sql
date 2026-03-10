-- Activity upvotes. Run after supabase-activities.sql (admin.activities exists).
-- Default: creator gets 1 upvote when they create an activity.

alter table admin.activities add column if not exists image_url text;

create table if not exists admin.activity_upvotes (
  activity_id uuid not null references admin.activities(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  primary key (activity_id, user_id)
);

create index if not exists activity_upvotes_user_id_idx on admin.activity_upvotes(user_id);

-- Must drop first because return type changes (setof admin.activities -> table with extra columns)
drop function if exists public.get_my_activities();

-- get_my_activities: return activities with upvote_count and has_upvoted (current user)
create function public.get_my_activities()
returns table (
  id uuid,
  user_id uuid,
  name text,
  description text,
  activity_type text,
  youtube_url text,
  usage_count integer,
  icon text,
  color text,
  image_url text,
  created_at timestamptz,
  updated_at timestamptz,
  upvote_count bigint,
  has_upvoted boolean
)
language plpgsql
security definer
set search_path = ''
as $$
begin
  return query
  select
    a.id,
    a.user_id,
    a.name,
    a.description,
    a.activity_type,
    a.youtube_url,
    a.usage_count,
    a.icon,
    a.color,
    a.image_url,
    a.created_at,
    a.updated_at,
    (select count(*)::bigint from admin.activity_upvotes u where u.activity_id = a.id),
    exists (select 1 from admin.activity_upvotes u where u.activity_id = a.id and u.user_id = auth.uid())
  from admin.activities a
  where a.user_id = auth.uid()
  order by a.name;
end;
$$;

-- get_org_activities: activities created by anyone in the current user's organization (same shape as get_my_activities)
create function public.get_org_activities()
returns table (
  id uuid,
  user_id uuid,
  name text,
  description text,
  activity_type text,
  youtube_url text,
  usage_count integer,
  icon text,
  color text,
  image_url text,
  created_at timestamptz,
  updated_at timestamptz,
  upvote_count bigint,
  has_upvoted boolean
)
language plpgsql
security definer
set search_path = ''
as $$
begin
  return query
  select
    a.id,
    a.user_id,
    a.name,
    a.description,
    a.activity_type,
    a.youtube_url,
    a.usage_count,
    a.icon,
    a.color,
    a.image_url,
    a.created_at,
    a.updated_at,
    (select count(*)::bigint from admin.activity_upvotes u where u.activity_id = a.id),
    exists (select 1 from admin.activity_upvotes u where u.activity_id = a.id and u.user_id = auth.uid())
  from admin.activities a
  join public.profiles p_creator on p_creator.id = a.user_id and p_creator.organization_id is not null
  join public.profiles p_me on p_me.id = auth.uid() and p_me.organization_id = p_creator.organization_id
  where p_me.organization_id is not null
  order by a.name;
end;
$$;

-- create_activity: add one upvote for the creator
create or replace function public.create_activity(
  p_name text,
  p_description text default null,
  p_activity_type text default 'create',
  p_youtube_url text default null,
  p_image_url text default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  new_id uuid;
begin
  if auth.uid() is null then return null; end if;
  if nullif(trim(p_name), '') is null then return null; end if;
  insert into admin.activities (user_id, name, description, activity_type, youtube_url, usage_count, image_url)
  values (
    auth.uid(),
    trim(p_name),
    nullif(trim(coalesce(p_description, '')), ''),
    case when p_activity_type = 'youtube' then 'youtube' else 'create' end,
    nullif(trim(coalesce(p_youtube_url, '')), ''),
    0,
    nullif(trim(coalesce(p_image_url, '')), '')
  )
  returning id into new_id;
  insert into admin.activity_upvotes (activity_id, user_id) values (new_id, auth.uid());
  return new_id;
end;
$$;

-- toggle_activity_upvote: add upvote if missing, remove if present
create or replace function public.toggle_activity_upvote(p_activity_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null or p_activity_id is null then return; end if;
  if exists (select 1 from admin.activity_upvotes where activity_id = p_activity_id and user_id = auth.uid()) then
    delete from admin.activity_upvotes where activity_id = p_activity_id and user_id = auth.uid();
  else
    insert into admin.activity_upvotes (activity_id, user_id) values (p_activity_id, auth.uid())
      on conflict (activity_id, user_id) do nothing;
  end if;
end;
$$;
