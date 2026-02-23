import Link from "next/link";

const PLAN_LABELS: Record<string, string> = {
  starter: "Starter",
  basic: "Basic",
  pro: "Pro",
};

export default async function PurchasePage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string; interval?: string }>;
}) {
  const { plan, interval } = await searchParams;
  const planId = plan && ["starter", "basic", "pro"].includes(plan) ? plan : null;
  const intervalId = interval && ["monthly", "annual"].includes(interval) ? interval : null;
  const planLabel = planId ? PLAN_LABELS[planId] : "a plan";
  const intervalLabel = intervalId === "annual" ? "Annual" : intervalId === "monthly" ? "Monthly" : null;
  const titleSuffix = planId && planId !== "starter" && intervalLabel ? ` (${intervalLabel})` : "";

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

      <div className="rounded-lg border border-zinc-200/80 bg-white/70 p-6 shadow-sm dark:border-zinc-700/50 dark:bg-zinc-900/60">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          Checkout
        </h2>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          {planId
            ? `You selected the ${planLabel}${intervalLabel ? ` ${intervalLabel.toLowerCase()}` : ""} plan. Integrate your payment provider (e.g. Stripe) to add billing and subscription management.`
            : "Select a plan on the pricing page to continue."}
        </p>
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
