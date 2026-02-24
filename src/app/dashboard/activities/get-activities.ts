import type { SupabaseClient } from "@supabase/supabase-js";
import type { Activity } from "@/types/activity";

/**
 * Fetches activities for the current user via RPC (reads from admin.activities).
 */
export async function getActivities(
  supabase: SupabaseClient
): Promise<Activity[]> {
  const { data, error } = await supabase.rpc("get_my_activities");

  if (error) return [];
  const rows = (data ?? []) as (Activity & { user_id?: string })[];
  return rows.map(({ user_id: _uid, ...a }) => a);
}
