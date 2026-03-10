import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Returns total count of student data entries for the current user's organization (corporation).
 * Uses RPC get_my_org_data_entries_count. Returns 0 if the RPC or table is missing.
 */
export async function getTotalOrgDataEntriesCount(
  supabase: SupabaseClient
): Promise<number> {
  const { data, error } = await supabase.rpc("get_my_org_data_entries_count");
  if (error) return 0;
  const n = typeof data === "number" ? data : Number(data);
  return Number.isFinite(n) && n >= 0 ? Math.floor(n) : 0;
}
