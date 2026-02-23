-- Run in Supabase SQL Editor to add subscription_plan and subscription_interval to admin.profiles.
-- subscription_plan: 'starter', 'basic', 'pro'. Default 'starter'.
-- subscription_interval: 'monthly', 'annual'. Default 'monthly' for paid plans.

alter table admin.profiles
  add column if not exists subscription_plan text default 'starter';

alter table admin.profiles
  add column if not exists subscription_interval text default 'monthly';

comment on column admin.profiles.subscription_plan is 'Current pricing plan: starter, basic, or pro';
comment on column admin.profiles.subscription_interval is 'Billing interval for basic/pro: monthly or annual';
