-- Add image_url to activities and refresh get_my_activities + create_activity.
-- Run in Supabase SQL Editor if your admin.activities table already exists without image_url.

alter table admin.activities add column if not exists image_url text;

create or replace function public.get_my_activities()
returns setof admin.activities
language plpgsql
security definer
set search_path = ''
as $$
begin
  return query
  select a.id, a.user_id, a.name, a.description, a.activity_type, a.youtube_url,
         a.usage_count, a.icon, a.color, a.image_url, a.created_at, a.updated_at
  from admin.activities a
  where a.user_id = auth.uid()
  order by a.name;
end;
$$;

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
  return new_id;
end;
$$;
