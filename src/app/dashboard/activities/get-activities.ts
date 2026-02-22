import type { SupabaseClient } from "@supabase/supabase-js";
import type { Activity } from "@/types/activity";

/**
 * Fetches activities for the current user from Supabase.
 * Wire this to your activities table when ready, e.g.:
 *
 *   const { data, error } = await supabase
 *     .from("activities")
 *     .select("id, name, description, icon, color, usage_count, created_at, updated_at")
 *     .order("name");
 *
 * Returns empty array until the table exists and is populated.
 */
export async function getActivities(
  supabase: SupabaseClient
): Promise<Activity[]> {
  // Uncomment and adjust when your Supabase activities table exists:
  // const { data, error } = await supabase
  //   .from("activities")
  //   .select("id, name, description, icon, color, usage_count, created_at, updated_at")
  //   .order("name");
  // if (error) return [];
  // return (data ?? []) as Activity[];

  return [];
}
