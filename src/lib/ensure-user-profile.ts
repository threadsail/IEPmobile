import { createServiceRoleClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";

/**
 * Creates public.profiles + admin.profiles + organization for OAuth users.
 * Prefer service role (reliable right after OAuth callback); fall back to user RPC.
 */
export async function ensureUserProfileSetup(userId: string): Promise<boolean> {
  try {
    const admin = createServiceRoleClient();
    const { error } = await admin.rpc("ensure_user_profile_setup_by_id", {
      p_user_id: userId,
    });
    if (!error) return true;
    console.error("[ensureUserProfileSetup] service role:", error.message);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[ensureUserProfileSetup] service role unavailable:", message);
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.rpc("ensure_user_profile_setup");
    if (!error) return true;
    console.error("[ensureUserProfileSetup] user rpc:", error.message);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[ensureUserProfileSetup] user rpc failed:", message);
  }

  return false;
}
