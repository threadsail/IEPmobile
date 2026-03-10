import Link from "next/link";
import { redirect } from "next/navigation";
import { getProfile } from "@/app/dashboard/profile/get-profile";
import { getCurrentUser } from "@/utils/auth";
import DowngradeForm from "./DowngradeForm";

type PlanId = "starter" | "basic" | "pro";

const PLAN_LABELS: Record<PlanId, string> = { starter: "Starter", basic: "Basic", pro: "Pro" };

function planFromProfile(profile: { subscription_plan?: string | null } | null): PlanId {
  const plan = profile?.subscription_plan;
  if (plan === "pro" || plan === "basic") return plan;
  if (plan === "starter") return "starter";
  return "basic";
}

function formatPeriodEnd(iso: string | null | undefined): string | null {
  if (!iso) return null;
  try {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { dateStyle: "long" });
  } catch {
    return null;
  }
}

export default async function DowngradePage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string; interval?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect(`/auth?next=${encodeURIComponent("/pricing/downgrade")}`);

  const { plan: planParam, interval: intervalParam } = await searchParams;
  const planId = planParam && (["starter", "basic", "pro"] as const).includes(planParam as PlanId)
    ? (planParam as PlanId)
    : null;
  const interval =
    intervalParam && (["monthly", "annual"] as const).includes(intervalParam as "monthly" | "annual")
      ? (intervalParam as "monthly" | "annual")
      : null;

  if (!planId) redirect("/pricing");

  const profile = await getProfile(user.id);
  const currentPlan = planFromProfile(profile);
  const currentLabel = PLAN_LABELS[currentPlan];
  const targetLabel = planId !== "starter" && interval
    ? `${PLAN_LABELS[planId]} (${interval === "annual" ? "Annual" : "Monthly"})`
    : PLAN_LABELS[planId];
  const periodEnd = formatPeriodEnd(profile?.subscription_period_end ?? null);

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
          Confirm downgrade
        </h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          You’re requesting to downgrade to {targetLabel}. Your current plan ({currentLabel}) will remain active until the end of your billing cycle.
        </p>
      </div>

      <div className="rounded-lg border border-zinc-200/80 bg-white/70 p-6 shadow-sm dark:border-zinc-700/50 dark:bg-zinc-900/60">
        {periodEnd ? (
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Billing cycle ends: <strong className="text-zinc-900 dark:text-zinc-100">{periodEnd}</strong>
          </p>
        ) : (
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Billing cycle end will be set when your payment is recorded. Your current plan remains in effect until then.
          </p>
        )}
        <DowngradeForm plan={planId} interval={interval} />
      </div>
    </div>
  );
}
