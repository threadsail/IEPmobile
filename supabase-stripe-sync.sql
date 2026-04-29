-- Run in Supabase SQL Editor after supabase-subscription-billing.sql.
-- Stores Stripe customer/subscription IDs and exposes a service-role-only RPC for webhook sync.

alter table admin.profiles
  add column if not exists stripe_customer_id text,
  add column if not exists stripe_subscription_id text;

comment on column admin.profiles.stripe_customer_id is 'Stripe Customer id (cus_...) for Checkout and Customer Portal';
comment on column admin.profiles.stripe_subscription_id is 'Active Stripe Subscription id (sub_...); null when on Starter or canceled';

-- Extend subscription read RPC
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
      downgrade_to_interval,
      stripe_customer_id,
      stripe_subscription_id
    from admin.profiles
    where id = auth.uid()
    limit 1
  ) t;
  return r;
end;
$$;

-- Called only from the app webhook using the Supabase service role key.
create or replace function public.sync_stripe_subscription_from_webhook(
  p_user_id uuid,
  p_plan text,
  p_interval text,
  p_period_start timestamptz,
  p_period_end timestamptz,
  p_stripe_customer_id text,
  p_stripe_subscription_id text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_plan text := case when p_plan in ('starter', 'basic', 'pro') then p_plan else 'starter' end;
  v_interval text := case when p_interval in ('monthly', 'annual') then p_interval else null end;
begin
  if coalesce((auth.jwt()->>'role'), '') <> 'service_role' then
    raise exception 'forbidden';
  end if;

  insert into admin.profiles (
    id,
    subscription_plan,
    subscription_interval,
    subscription_period_start,
    subscription_period_end,
    stripe_customer_id,
    stripe_subscription_id,
    downgrade_to_plan,
    downgrade_to_interval,
    updated_at
  )
  values (
    p_user_id,
    v_plan,
    v_interval,
    p_period_start,
    p_period_end,
    p_stripe_customer_id,
    p_stripe_subscription_id,
    null,
    null,
    now()
  )
  on conflict (id) do update set
    subscription_plan = excluded.subscription_plan,
    subscription_interval = excluded.subscription_interval,
    subscription_period_start = excluded.subscription_period_start,
    subscription_period_end = excluded.subscription_period_end,
    stripe_customer_id = coalesce(excluded.stripe_customer_id, admin.profiles.stripe_customer_id),
    stripe_subscription_id = excluded.stripe_subscription_id,
    downgrade_to_plan = null,
    downgrade_to_interval = null,
    updated_at = now();
end;
$$;

revoke all on function public.sync_stripe_subscription_from_webhook(
  uuid, text, text, timestamptz, timestamptz, text, text
) from public;

grant execute on function public.sync_stripe_subscription_from_webhook(
  uuid, text, text, timestamptz, timestamptz, text, text
) to service_role;

-- Webhook fallback when subscription metadata is missing (e.g. legacy customers).
create or replace function public.admin_user_id_by_stripe_customer(p_customer_id text)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
begin
  if coalesce((auth.jwt()->>'role'), '') <> 'service_role' then
    raise exception 'forbidden';
  end if;
  return (select id from admin.profiles where stripe_customer_id = p_customer_id limit 1);
end;
$$;

revoke all on function public.admin_user_id_by_stripe_customer(text) from public;

grant execute on function public.admin_user_id_by_stripe_customer(text) to service_role;
