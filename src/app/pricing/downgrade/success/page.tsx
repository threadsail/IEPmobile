import Link from "next/link";
import { redirect } from "next/navigation";
import { getProfile } from "@/app/dashboard/profile/get-profile";
import { getCurrentUser } from "@/utils/auth";

const PLAN_LABELS: Record<string, string> = { starter: "Starter", basic: "Basic", pro: "Pro" };

function formatPeriodEnd(iso: string | null | undefined): string | null {
  if (!iso) return null;
  try {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { dateStyle: "long" });
  } catch {
    return null;
  }
}

export default async function DowngradeSuccessPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth");

  const profile = await getProfile(user.id);
  const periodEnd = formatPeriodEnd(profile?.subscription_period_end ?? null);
  const downgradePlan = profile?.downgrade_to_plan;
  const downgradeInterval = profile?.downgrade_to_interval;
  const targetLabel = downgradePlan
    ? downgradePlan === "starter"
      ? PLAN_LABELS.starter
      : `${PLAN_LABELS[downgradePlan] ?? downgradePlan}${downgradeInterval ? ` (${downgradeInterval === "annual" ? "Annual" : "Monthly"})` : ""}`
    : "your selected plan";

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
          Downgrade scheduled
        </h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          Your subscription will be active until the end of your billing cycle. After that, you’ll be on {targetLabel}.
        </p>
      </div>

      <div className="rounded-lg border border-zinc-200/80 bg-white/70 p-6 shadow-sm dark:border-zinc-700/50 dark:bg-zinc-900/60">
        {periodEnd ? (
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Billing cycle ends: <strong className="text-zinc-900 dark:text-zinc-100">{periodEnd}</strong>
          </p>
        ) : (
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Billing cycle end will be set when your payment is recorded. Your current plan remains in effect until the end of that period.
          </p>
        )}
        <div className="mt-4 flex flex-wrap gap-3">
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
            View plans
          </Link>
        </div>
      </div>
    </div>
  );
}
