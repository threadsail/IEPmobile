import { cache } from "react";
import { createClient } from "@/utils/supabase/server";

/**
 * Cached per-request. Call this from layout, page, or footer—only one
 * network round-trip to Supabase for the session.
 */
export const getCurrentUser = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});
