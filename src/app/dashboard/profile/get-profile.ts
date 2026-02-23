import { cache } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Profile } from "@/types/profile";
import { createClient } from "@/utils/supabase/server";

/** Fetches subscription_plan from admin.profiles. Returns null if column or row missing. */
async function getSubscriptionPlan(
  supabase: SupabaseClient,
  userId: string
): Promise<"starter" | "basic" | "pro" | null> {
  const { data, error } = await supabase
    .schema("admin")
    .from("profiles")
    .select("subscription_plan")
    .eq("id", userId)
    .maybeSingle();

  if (error || !data?.subscription_plan) return null;
  const plan = data.subscription_plan;
  return plan === "starter" || plan === "basic" || plan === "pro" ? plan : null;
}

/** Fetches subscription_interval. Returns null if column or row missing. */
async function getSubscriptionInterval(
  supabase: SupabaseClient,
  userId: string
): Promise<"monthly" | "annual" | null> {
  const { data, error } = await supabase
    .schema("admin")
    .from("profiles")
    .select("subscription_interval")
    .eq("id", userId)
    .maybeSingle();

  if (error || !data?.subscription_interval) return null;
  const interval = data.subscription_interval;
  return interval === "monthly" || interval === "annual" ? interval : null;
}

async function getProfileWithClient(
  supabase: SupabaseClient,
  userId: string
): Promise<Profile | null> {
  const [publicResult, planResult, intervalResult] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, username, created_at, updated_at, first_name, last_name, full_name, role")
      .eq("id", userId)
      .maybeSingle(),
    getSubscriptionPlan(supabase, userId),
    getSubscriptionInterval(supabase, userId),
  ]);

  const data = publicResult.data;
  const publicError = publicResult.error;

  if (publicError) {
    return null;
  }

  const base = data ?? {
    id: userId,
    username: null,
    created_at: null,
    updated_at: null,
    first_name: null,
    last_name: null,
    full_name: null,
    role: null,
  };

  return {
    ...(base as Omit<Profile, "subscription_plan" | "subscription_interval">),
    subscription_plan: planResult ?? null,
    subscription_interval: intervalResult ?? null,
  } as Profile;
}

/**
 * Cached per-request by userId. Fetches profile (id, username, first_name, last_name, full_name, role, created_at, updated_at) from public.profiles,
 * and subscription_plan/subscription_interval from admin.profiles.
 */
export const getProfile = cache(async (userId: string): Promise<Profile | null> => {
  const supabase = await createClient();
  return getProfileWithClient(supabase, userId);
});

/**
 * Use when you already have a Supabase client (e.g. in a route handler).
 * Does not use request cache.
 */
export async function getProfileWithSupabase(
  supabase: SupabaseClient,
  userId: string
): Promise<Profile | null> {
  return getProfileWithClient(supabase, userId);
}
