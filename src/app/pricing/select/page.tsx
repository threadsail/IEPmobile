import Link from "next/link";
import { redirect } from "next/navigation";
import { getProfile } from "@/app/dashboard/profile/get-profile";
import { getCurrentUser } from "@/utils/auth";

type PlanId = "starter" | "basic" | "pro";
type Interval = "monthly" | "annual" | null;

const PLAN_LABELS: Record<PlanId, string> = { starter: "Starter", basic: "Basic", pro: "Pro" };

/** Subscription tier order: 1=Starter, 2=Basic monthly, 3=Pro monthly, 4=Basic annual, 5=Pro annual. */
function subscriptionLevel(plan: PlanId, interval: Interval): number {
  if (plan === "starter") return 1;
  if (plan === "basic" && interval !== "annual") return 2;
  if (plan === "pro" && interval !== "annual") return 3;
  if (plan === "basic" && interval === "annual") return 4;
  return 5; // pro annual
}

/** Current plan from profile. New accounts (null/missing plan) default to Basic. */
function planFromProfile(profile: { subscription_plan?: string | null; subscription_interval?: string | null } | null): PlanId {
  const plan = profile?.subscription_plan;
  if (plan === "pro" || plan === "basic") return plan;
  if (plan === "starter") return "starter";
  return "basic";
}

/** Format ISO date for display. */
function formatDate(iso: string | null | undefined): string | null {
  if (!iso) return null;
  try {
    return new Date(iso).toLocaleDateString(undefined, { dateStyle: "long" });
  } catch {
    return null;
  }
}

/**
 * Renewal date: use period_end if set; otherwise for monthly add 1 month to period_start,
 * for annual add 1 year. Returns null if not computable.
 */
function renewalDate(profile: {
  subscription_period_end?: string | null;
  subscription_period_start?: string | null;
  subscription_interval?: string | null;
} | null): string | null {
  if (!profile) return null;
  if (profile.subscription_period_end) {
    return formatDate(profile.subscription_period_end);
  }
  const start = profile.subscription_period_start;
  const interval = profile.subscription_interval;
  if (!start || !interval) return null;
  try {
    const d = new Date(start);
    if (interval === "monthly") {
      d.setMonth(d.getMonth() + 1);
    } else if (interval === "annual") {
      d.setFullYear(d.getFullYear() + 1);
    } else {
      return null;
    }
    return d.toLocaleDateString(undefined, { dateStyle: "long" });
  } catch {
    return null;
  }
}

export default async function PricingSelectPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string; interval?: string }>;
}) {
  const user = await getCurrentUser();
  const { plan: planParam, interval: intervalParam } = await searchParams;

  const planId = planParam && (["starter", "basic", "pro"] as const).includes(planParam as PlanId)
    ? (planParam as PlanId)
    : null;
  const interval =
    intervalParam && (["monthly", "annual"] as const).includes(intervalParam as "monthly" | "annual")
      ? (intervalParam as "monthly" | "annual")
      : null;

  if (!planId) {
    redirect("/pricing");
  }

  const returnPath = `/pricing/select?plan=${planId}${planId !== "starter" && interval ? `&interval=${interval}` : ""}`;

  if (!user) {
    redirect(`/auth?next=${encodeURIComponent(returnPath)}`);
  }

  const profile = await getProfile(user.id);
  const currentPlan = planFromProfile(profile);
  const currentInterval = (profile?.subscription_interval === "annual" || profile?.subscription_interval === "monthly")
    ? profile.subscription_interval
    : null;
  const currentLevel = subscriptionLevel(currentPlan, currentInterval);
  const selectedInterval = planId !== "starter" && interval ? interval : null;
  const selectedLevel = subscriptionLevel(planId, selectedInterval);

  if (selectedLevel > currentLevel) {
    const checkoutQuery = planId !== "starter" && interval
      ? `?plan=${planId}&interval=${interval}`
      : `?plan=${planId}`;
    redirect(`/dashboard/purchase${checkoutQuery}`);
  }

  const planLabel = PLAN_LABELS[planId];
  const intervalLabel = interval === "annual" ? "Annual" : interval === "monthly" ? "Monthly" : null;
  const selectionLabel = intervalLabel ? `${planLabel} (${intervalLabel})` : planLabel;
  const isDowngrade = selectedLevel < currentLevel;
  const downgradeHref = `/pricing/downgrade?plan=${planId}${planId !== "starter" && interval ? `&interval=${interval}` : ""}`;

  return (
    <div className="w-full space-y-6">
      <div>
        <Link
          href="/pricing"
          className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
        >
          ← Back to pricing
        </Link>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
          You already have this plan or better
        </h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          Your account already includes the {selectionLabel} plan. There’s no need to change anything.
        </p>
      </div>

      <div className="rounded-lg border border-zinc-200/80 bg-white/70 p-6 shadow-sm dark:border-zinc-700/50 dark:bg-zinc-900/60">
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Your current plan: <strong className="text-zinc-900 dark:text-zinc-100">{PLAN_LABELS[currentPlan]}</strong>
          {currentPlan !== "starter" && profile?.subscription_interval && (
            <span> ({profile.subscription_interval === "annual" ? "Annual" : "Monthly"})</span>
          )}
          {currentPlan !== "starter" && (() => {
            const renewal = renewalDate(profile);
            return renewal ? (
              <span className="ml-1"> · Renewal date: <strong className="text-zinc-900 dark:text-zinc-100">{renewal}</strong></span>
            ) : null;
          })()}
        </p>
        {isDowngrade && (
          <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
            Would you like to downgrade to {selectionLabel}?
          </p>
        )}
        <div className="mt-4 flex flex-wrap gap-3">
          {isDowngrade && (
            <Link
              href={downgradeHref}
              className="inline-flex items-center justify-center rounded-lg border border-amber-500 bg-amber-50 px-4 py-2.5 text-sm font-medium text-amber-800 transition-colors hover:bg-amber-100 dark:border-amber-600 dark:bg-amber-950/50 dark:text-amber-200 dark:hover:bg-amber-900/50"
            >
              Downgrade to {selectionLabel}
            </Link>
          )}
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
          >
            Go to dashboard
          </Link>
          <Link
            href="/pricing"
            className="inline-flex items-center justify-center rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
          >
            View all plans
          </Link>
        </div>
      </div>
    </div>
  );
}
