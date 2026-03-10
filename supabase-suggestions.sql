-- Suggestions and upvotes. Run in Supabase SQL Editor.
-- Requires: auth.users, public.profiles (for author display).

create table if not exists public.suggestions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  content text not null,
  status text not null default 'suggested' check (status in ('suggested', 'approved', 'in_progress', 'testing', 'completed')),
  created_at timestamptz default now()
);

create index if not exists suggestions_created_at_idx on public.suggestions(created_at desc);

create table if not exists public.suggestion_upvotes (
  suggestion_id uuid not null references public.suggestions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  primary key (suggestion_id, user_id)
);

create index if not exists suggestion_upvotes_user_id_idx on public.suggestion_upvotes(user_id);

alter table public.suggestions enable row level security;
alter table public.suggestion_upvotes enable row level security;

-- Anyone authenticated can read suggestions
create policy "Authenticated can read suggestions"
  on public.suggestions for select
  to authenticated
  using (true);

-- Users can insert their own suggestion
create policy "Users can insert own suggestion"
  on public.suggestions for insert
  to authenticated
  with check (auth.uid() = user_id);

-- Users can read all upvotes (needed to show counts and "you upvoted")
create policy "Authenticated can read upvotes"
  on public.suggestion_upvotes for select
  to authenticated
  using (true);

-- Users can insert their own upvote
create policy "Users can insert own upvote"
  on public.suggestion_upvotes for insert
  to authenticated
  with check (auth.uid() = user_id);

-- Users can delete their own upvote (toggle off)
create policy "Users can delete own upvote"
  on public.suggestion_upvotes for delete
  to authenticated
  using (auth.uid() = user_id);

-- Only Superadmin can update suggestions (e.g. change status)
create policy "Superadmin can update suggestions"
  on public.suggestions for update
  to authenticated
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'Superadmin')
  )
  with check (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'Superadmin')
  );
