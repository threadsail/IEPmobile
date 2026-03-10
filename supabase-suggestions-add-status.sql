-- Migration: add status and Superadmin-only update for suggestions.
-- Run if you already applied supabase-suggestions.sql before status existed.

alter table public.suggestions
  add column if not exists status text not null default 'suggested';

alter table public.suggestions
  drop constraint if exists suggestions_status_check;

alter table public.suggestions
  add constraint suggestions_status_check
  check (status in ('suggested', 'approved', 'in_progress', 'testing', 'completed'));

-- Only Superadmin can update suggestions
drop policy if exists "Superadmin can update suggestions" on public.suggestions;
create policy "Superadmin can update suggestions"
  on public.suggestions for update
  to authenticated
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'Superadmin')
  )
  with check (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'Superadmin')
  );
