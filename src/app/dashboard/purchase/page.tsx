import Link from "next/link";
import { getCurrentUser } from "@/utils/auth";
import { getProfile } from "@/app/dashboard/profile/get-profile";
import TestApplySubscriptionButton from "./TestApplySubscriptionButton";
import { PLANS } from "@/components/PricingPlans";

const PLAN_LABELS: Record<string, string> = {
  starter: "Starter",
  basic: "Basic",
  pro: "Pro",
};

type PlanId = "starter" | "basic" | "pro";

/** Resolve current plan from profile; null/missing treated as Basic. */
function planFromProfile(
  profile: { subscription_plan?: string | null; subscription_interval?: string | null } | null
): { plan: PlanId; interval: "monthly" | "annual" | null } {
  const rawPlan = profile?.subscription_plan;
  const plan: PlanId =
    rawPlan === "pro" || rawPlan === "basic" ? rawPlan : rawPlan === "starter" ? "starter" : "basic";

  const rawInterval = profile?.subscription_interval;
  const interval =
    rawInterval === "annual" || rawInterval === "monthly" ? rawInterval : null;

  return { plan, interval };
}

function getPlanPrice(plan: PlanId, interval: "monthly" | "annual" | null): number {
  if (plan === "starter") return 0;
  const prices = PLANS[plan];
  if (!interval || interval === "monthly") return prices.monthly;
  return prices.annual;
}

function getPeriodBounds(profile: { subscription_period_start?: string | null; subscription_period_end?: string | null; subscription_interval?: string | null } | null) {
  const startIso = profile?.subscription_period_start ?? null;
  const endIso = profile?.subscription_period_end ?? null;
  const interval = profile?.subscription_interval ?? null;
  if (!startIso) return null;
  try {
    const start = new Date(startIso);
    if (Number.isNaN(start.getTime())) return null;
    if (endIso) {
      const end = new Date(endIso);
      if (Number.isNaN(end.getTime()) || end <= start) return null;
      return { start, end };
    }
    // Fallback: derive end from start + interval
    const end = new Date(start);
    if (interval === "annual") {
      end.setFullYear(end.getFullYear() + 1);
    } else {
      end.setMonth(end.getMonth() + 1);
    }
    return { start, end };
  } catch {
    return null;
  }
}

export default async function PurchasePage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string; interval?: string }>;
}) {
  const user = await getCurrentUser();
  const profile = user ? await getProfile(user.id) : null;
  const { plan: currentPlan, interval: currentInterval } = planFromProfile(profile);

  const { plan, interval } = await searchParams;
  const validPlanIds = ["starter", "basic", "pro"] as const;
  const planId: PlanId | null =
    plan && (validPlanIds as readonly string[]).includes(plan) ? (plan as PlanId) : null;
  const validIntervals = ["monthly", "annual"] as const;
  const intervalId: "monthly" | "annual" | null =
    interval && (validIntervals as readonly string[]).includes(interval) ? (interval as "monthly" | "annual") : null;
  const planLabel = planId ? PLAN_LABELS[planId] : "a plan";
  const intervalLabel = intervalId === "annual" ? "Annual" : intervalId === "monthly" ? "Monthly" : null;
  const titleSuffix = planId && planId !== "starter" && intervalLabel ? ` (${intervalLabel})` : "";

  let estimatedUpgradeCharge: number | null = null;
  if (
    user &&
    profile &&
    planId &&
    intervalId &&
    planId !== "starter" &&
    currentPlan !== "starter" &&
    currentPlan !== planId &&
    currentInterval === intervalId
  ) {
    const bounds = getPeriodBounds(profile);
    if (bounds) {
      const fullUpgradePrice = getPlanPrice(planId as PlanId, intervalId);
      const currentPrice = getPlanPrice(currentPlan, currentInterval);
      if (fullUpgradePrice > 0 && currentPrice > 0) {
        const now = new Date();
        const clampedNow =
          now < bounds.start ? bounds.start : now > bounds.end ? bounds.end : now;
        const totalMs = bounds.end.getTime() - bounds.start.getTime();
        const usedMs = clampedNow.getTime() - bounds.start.getTime();
        const usedFraction = totalMs > 0 ? Math.min(Math.max(usedMs / totalMs, 0), 1) : 1;
        const usedValue = currentPrice * usedFraction;
        const credit = currentPrice - usedValue;
        const charge = fullUpgradePrice - credit;
        estimatedUpgradeCharge = Math.max(Math.round(charge * 100) / 100, 0);
      }
    }
  }

  return (
    <div className="w-full space-y-6">
      <div>
        <Link
          href="/pricing"
          className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
        >
          ← Back to pricing
        </Link>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          Purchase {planLabel}{titleSuffix}
        </h1>
        <p className="mt-1 text-zinc-600 dark:text-zinc-400">
          Complete your subscription for the {planLabel}{titleSuffix} plan. Checkout and payment will be available here.
        </p>
      </div>

      <div className="rounded-xl bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 p-[1.5px] shadow-md">
        <div className="h-full w-full rounded-xl bg-white/95 px-5 py-4 dark:bg-zinc-950/95">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-blue-900 dark:text-blue-200">
            Current subscription
          </h2>
          <p className="mt-1 text-base font-semibold text-zinc-900 dark:text-zinc-50">
          {user ? (
            <>
              {PLAN_LABELS[currentPlan]}
              {currentPlan !== "starter" && currentInterval && (
                <> ({currentInterval === "annual" ? "Annual" : "Monthly"})</>
              )}
            </>
          ) : (
            "Not signed in."
          )}
          </p>
        </div>
      </div>

      <div className="rounded-lg border border-zinc-200/80 bg-white/70 p-6 shadow-sm dark:border-zinc-700/50 dark:bg-zinc-900/60">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          Checkout
        </h2>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          {planId
            ? `You selected the ${planLabel}${intervalLabel ? ` ${intervalLabel.toLowerCase()}` : ""} plan. Integrate your payment provider (e.g. Stripe) to add billing and subscription management.`
            : "Select a plan on the pricing page to continue."}
        </p>
        {estimatedUpgradeCharge !== null && (
          <p className="mt-2 text-sm font-medium text-emerald-700 dark:text-emerald-300">
            Estimated upgrade charge today: ${estimatedUpgradeCharge.toFixed(2)}
            <span className="ml-1 text-xs font-normal text-zinc-500 dark:text-zinc-400">
              (current period credit applied; final amount may vary slightly at checkout)
            </span>
          </p>
        )}
        {planId && (
          <TestApplySubscriptionButton
            plan={planId}
            interval={planId !== "starter" ? intervalId : null}
          />
        )}
        {!planId && (
          <Link
            href="/pricing"
            className="mt-4 inline-block rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
          >
            View plans
          </Link>
        )}
      </div>
    </div>
  );
}
