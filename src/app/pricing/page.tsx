import { getProfile } from "@/app/dashboard/profile/get-profile";
import { getCurrentUser } from "@/utils/auth";
import PricingPlans from "@/components/PricingPlans";
import type { Profile } from "@/types/profile";

type PlanId = "starter" | "basic" | "pro";

/** Logged-in users default to starter; only basic/pro from DB count as purchased. */
function planFromProfile(profile: Profile | null, isLoggedIn: boolean): PlanId | null {
  if (!isLoggedIn) return null;
  const plan = profile?.subscription_plan;
  if (plan === "basic" || plan === "pro") return plan;
  return "starter";
}

/** User's billing interval for basic/pro; null or missing treated as monthly. */
function intervalFromProfile(profile: Profile | null): "monthly" | "annual" | null {
  return profile?.subscription_interval ?? null;
}

export default async function PricingPage() {
  const user = await getCurrentUser();
  const profile = user ? await getProfile(user.id) : null;
  const currentPlan = planFromProfile(profile, !!user);
  const currentInterval = intervalFromProfile(profile);

  return <PricingPlans currentPlan={currentPlan} currentInterval={currentInterval} />;
}
