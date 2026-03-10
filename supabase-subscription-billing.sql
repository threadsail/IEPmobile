-- Run in Supabase SQL Editor after supabase-add-subscription-plan.sql.
-- Adds billing period and downgrade scheduling for admin.profiles.
--
-- When a Stripe payment is marked paid (e.g. in a Stripe webhook or checkout success handler),
-- update the user's admin.profiles row:
--   update admin.profiles set
--     subscription_plan = 'basic',  -- or 'pro'
--     subscription_interval = 'monthly',  -- or 'annual'
--     subscription_period_start = '2025-03-10T00:00:00Z',  -- Stripe current_period_start; update on each renewal
--     subscription_period_end = '2025-04-10T00:00:00Z'     -- Stripe current_period_end (renewal date)
--   where id = auth.uid();
-- On each renewal, update both subscription_period_start and subscription_period_end until cancelled.

alter table admin.profiles
  add column if not exists subscription_period_start timestamptz,
  add column if not exists subscription_period_end timestamptz,
  add column if not exists downgrade_to_plan text,
  add column if not exists downgrade_to_interval text;

comment on column admin.profiles.subscription_period_start is 'Start of current paid period (purchase/renewal date); set when Stripe payment is marked paid, update on renewal';
comment on column admin.profiles.subscription_period_end is 'End of current paid billing period (renewal date); set when Stripe payment is marked paid, update on renewal';
comment on column admin.profiles.downgrade_to_plan is 'Requested plan at period end: starter, basic, or pro';
comment on column admin.profiles.downgrade_to_interval is 'Requested interval at period end: monthly or annual';

-- RPC so the app can read subscription without direct admin schema access (fixes "current plan" not updating).
create or replace function public.get_my_subscription()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  r jsonb;
begin
  if auth.uid() is null then return null; end if;
  select to_jsonb(t)
  into r
  from (
    select
      subscription_plan,
      subscription_interval,
      subscription_period_start,
      subscription_period_end,
      downgrade_to_plan,
      downgrade_to_interval
    from admin.profiles
    where id = auth.uid()
    limit 1
  ) t;
  return r;
end;
$$;

-- RPC so the app can set downgrade without direct admin schema access (avoids "invalid schema admin").
create or replace function public.request_subscription_downgrade(
  p_plan text,
  p_interval text default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then return; end if;
  update admin.profiles
  set
    downgrade_to_plan = case when p_plan in ('starter', 'basic', 'pro') then p_plan else downgrade_to_plan end,
    downgrade_to_interval = case when p_interval in ('monthly', 'annual') then p_interval else null end
  where id = auth.uid();
end;
$$;

-- RPC for checkout "test apply plan" (upgrade). Upserts so subscription updates even when no row existed.
-- Upgrade = set current subscription immediately. Downgrade is handled by request_subscription_downgrade (keeps plan until period end).
create or replace function public.test_apply_subscription(
  p_plan text,
  p_interval text default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_plan text := case when p_plan in ('starter', 'basic', 'pro') then p_plan else 'basic' end;
  v_interval text := case when p_interval in ('monthly', 'annual') then p_interval else null end;
  v_start timestamptz := null;
  v_end timestamptz := null;
begin
  if auth.uid() is null then return; end if;
  if v_plan <> 'starter' and v_interval is not null then
    v_start := now();
    v_end := case when v_interval = 'monthly' then v_start + interval '1 month' else v_start + interval '1 year' end;
  end if;
  insert into admin.profiles (id, subscription_plan, subscription_interval, subscription_period_start, subscription_period_end, downgrade_to_plan, downgrade_to_interval)
  values (auth.uid(), v_plan, v_interval, v_start, v_end, null, null)
  on conflict (id) do update set
    subscription_plan = excluded.subscription_plan,
    subscription_interval = excluded.subscription_interval,
    subscription_period_start = excluded.subscription_period_start,
    subscription_period_end = excluded.subscription_period_end,
    downgrade_to_plan = null,
    downgrade_to_interval = null;
end;
$$;
