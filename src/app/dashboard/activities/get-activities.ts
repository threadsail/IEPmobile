import type { SupabaseClient } from "@supabase/supabase-js";
import type { Activity } from "@/types/activity";

export type ActivityFilter = "mine" | "org";

/** Map filter to RPC name. "org" = activities created by current organization; "mine" = only current user's. */
const RPC_BY_FILTER: Record<ActivityFilter, string> = {
  mine: "get_my_activities",
  org: "get_org_activities",
};

/**
 * Fetches activities via RPC. scope "org" = activities created by the current organization; "mine" = only the current user's.
 */
export async function getActivities(
  supabase: SupabaseClient,
  scope: ActivityFilter = "org"
): Promise<Activity[]> {
  const rpc = RPC_BY_FILTER[scope];
  const { data, error } = await supabase.rpc(rpc);

  if (error) return [];
  const rows = (data ?? []) as (Activity & { user_id?: string; upvote_count?: number; has_upvoted?: boolean })[];
  return rows.map(({ user_id: _uid, ...a }) => ({
    ...a,
    upvote_count: a.upvote_count ?? 0,
    has_upvoted: a.has_upvoted ?? false,
  }));
}
