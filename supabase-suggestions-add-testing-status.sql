-- Add 'testing' status between in_progress and completed.
-- Run if you already have suggestions with the 4-status constraint.

alter table public.suggestions
  drop constraint if exists suggestions_status_check;

alter table public.suggestions
  add constraint suggestions_status_check
  check (status in ('suggested', 'approved', 'in_progress', 'testing', 'completed'));
