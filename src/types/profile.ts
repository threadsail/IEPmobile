/**
 * Matches public.profiles: id, username, first_name, last_name, full_name, role, organization_id, created_at, updated_at.
 * subscription_plan and subscription_interval come from admin.profiles.
 * organization_name is resolved from admin.organization via organization_id.
 */
export type Profile = {
  id: string;
  username: string | null;
  created_at: string | null;
  updated_at: string | null;
  role: string | null;
  first_name: string | null;
  last_name: string | null;
  full_name: string | null;
  organization_id: string | null;
  /** From admin.organization */
  organization_name: string | null;
  /** From admin.profiles */
  subscription_plan: "starter" | "basic" | "pro" | null;
  /** From admin.profiles */
  subscription_interval: "monthly" | "annual" | null;
};
