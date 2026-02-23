/**
 * Matches public.profiles table. Add columns in Supabase and here when you extend the schema.
 * role, first_name, last_name are populated from the admin schema when linked.
 */
export type Profile = {
  id: string;
  username: string | null;
  created_at: string | null;
  updated_at: string | null;
  // Optional fields you can add to Supabase later:
  // full_name: string | null;
  // avatar_url: string | null;
  /** From admin schema when connected */
  role: string | null;
  first_name: string | null;
  last_name: string | null;
  /** Current pricing plan. From admin.profiles.subscription_plan. */
  subscription_plan: "starter" | "basic" | "pro" | null;
  /** Billing interval for basic/pro. From admin.profiles.subscription_interval. */
  subscription_interval: "monthly" | "annual" | null;
};
