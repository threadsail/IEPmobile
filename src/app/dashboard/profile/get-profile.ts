import type { SupabaseClient } from "@supabase/supabase-js";
import type { Profile } from "@/types/profile";

/**
 * Fetches role, first_name, last_name from the admin schema (admin.profiles).
 * Returns null if the schema/table doesn't exist yet or no row exists.
 */
export async function getAdminProfile(
  supabase: SupabaseClient,
  userId: string
): Promise<{ role: string | null; first_name: string | null; last_name: string | null } | null> {
  const { data, error } = await supabase
    .schema("admin")
    .from("profiles")
    .select("role, first_name, last_name")
    .eq("id", userId)
    .single();

  if (error || !data) return null;
  return {
    role: data.role ?? null,
    first_name: data.first_name ?? null,
    last_name: data.last_name ?? null,
  };
}

/**
 * Fetches the profile row for the given user id from public.profiles.
 * Merges in role, first_name, last_name from admin.profiles when the admin schema exists.
 * Returns null if public.profiles doesn't exist yet, RLS denies access, or no row exists.
 */
export async function getProfile(
  supabase: SupabaseClient,
  userId: string
): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, username, created_at, updated_at")
    .eq("id", userId)
    .single();

  if (error || !data) return null;

  const admin = await getAdminProfile(supabase, userId);

  return {
    ...(data as Omit<Profile, "role" | "first_name" | "last_name">),
    role: admin?.role ?? null,
    first_name: admin?.first_name ?? null,
    last_name: admin?.last_name ?? null,
  } as Profile;
}
