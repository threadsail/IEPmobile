"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { testApplySubscription } from "./actions";

type PlanId = "starter" | "basic" | "pro";

export default function TestApplySubscriptionButton({
  plan,
  interval,
}: {
  plan: PlanId;
  interval: "monthly" | "annual" | null;
}) {
  const router = useRouter();
  const [state, formAction] = useActionState(
    (prev: { error?: string; success?: boolean }, _formData: FormData) =>
      testApplySubscription(prev, plan, interval),
    {}
  );

  const planLabelMap: Record<PlanId, string> = {
    starter: "Starter",
    basic: "Basic",
    pro: "Pro",
  };
  const parts: string[] = [planLabelMap[plan]];
  if (interval === "monthly") parts.push("Monthly");
  if (interval === "annual") parts.push("Annual");
  const buttonLabel = `Test: apply ${parts.join(" ")} plan`;

  useEffect(() => {
    if (state?.success) {
      router.refresh();
    }
  }, [state?.success, router]);

  return (
    <form action={formAction} className="mt-4">
      <button
        type="submit"
        className="rounded-md border border-emerald-600 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-800 transition-colors hover:bg-emerald-100 dark:border-emerald-500 dark:bg-emerald-950/50 dark:text-emerald-200 dark:hover:bg-emerald-900/50"
      >
        {buttonLabel}
      </button>
      {state?.error && (
        <p className="mt-2 text-sm text-red-600 dark:text-red-400">{state.error}</p>
      )}
    </form>
  );
}
