import { cache } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Profile } from "@/types/profile";
import { createClient } from "@/utils/supabase/server";

/**
 * Fetches role, first_name, last_name from the admin schema (admin.profiles).
 * Returns null if the schema/table doesn't exist yet or no row exists.
 */
export async function getAdminProfile(
  supabase: SupabaseClient,
  userId: string
): Promise<{
  role: string | null;
  first_name: string | null;
  last_name: string | null;
} | null> {
  const { data, error } = await supabase
    .schema("admin")
    .from("profiles")
    .select("role, first_name, last_name")
    .eq("id", userId)
    .maybeSingle();

  if (error) return null;
  if (!data) return null;
  return {
    role: data.role ?? null,
    first_name: data.first_name ?? null,
    last_name: data.last_name ?? null,
  };
}

/** Fetches subscription_plan. Returns null if column or row missing. */
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
  const [publicResult, adminResult, planResult, intervalResult] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, username, created_at, updated_at")
      .eq("id", userId)
      .maybeSingle(),
    getAdminProfile(supabase, userId),
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
  };

  const admin = adminResult;

  return {
    ...(base as Omit<Profile, "role" | "first_name" | "last_name" | "subscription_plan" | "subscription_interval">),
    role: admin?.role ?? null,
    first_name: admin?.first_name ?? null,
    last_name: admin?.last_name ?? null,
    subscription_plan: planResult ?? null,
    subscription_interval: intervalResult ?? null,
  } as Profile;
}

/**
 * Cached per-request by userId. Fetches from public.profiles and admin.profiles in parallel.
 * Use this in server components when you only have the user id.
 */
export const getProfile = cache(async (userId: string): Promise<Profile | null> => {
  const supabase = await createClient();
  return getProfileWithClient(supabase, userId);
});

/**
 * Use when you already have a Supabase client (e.g. in a route handler).
 * Does not use request cache; runs public + admin fetches in parallel.
 */
export async function getProfileWithSupabase(
  supabase: SupabaseClient,
  userId: string
): Promise<Profile | null> {
  return getProfileWithClient(supabase, userId);
}
