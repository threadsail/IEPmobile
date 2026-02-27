-- Add grade and classroom to admin.students if they don't exist.
-- Run in Supabase SQL Editor when you see: column "grade" of relation "students" does not exist

create schema if not exists admin;

alter table admin.students add column if not exists grade text;
alter table admin.students add column if not exists classroom text;
