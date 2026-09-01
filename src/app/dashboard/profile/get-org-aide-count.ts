import type { SupabaseClient } from "@supabase/supabase-js";

export async function getOrganizationAideCount(
  supabase: SupabaseClient
): Promise<number> {
  const { data, error } = await supabase.rpc("count_my_organization_aides");
  if (error || data == null) return 0;
  return typeof data === "number" ? data : Number(data) || 0;
}
