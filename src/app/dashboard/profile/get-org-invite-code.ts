import type { SupabaseClient } from "@supabase/supabase-js";

export async function getOrganizationInviteCode(
  supabase: SupabaseClient
): Promise<string | null> {
  const { data, error } = await supabase.rpc("get_my_organization_invite_code");
  if (error || data == null) return null;
  return String(data);
}
