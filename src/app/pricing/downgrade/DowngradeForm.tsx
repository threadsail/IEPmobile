"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { requestDowngrade } from "../actions";

type PlanId = "starter" | "basic" | "pro";

export default function DowngradeForm({
  plan,
  interval,
}: {
  plan: PlanId;
  interval: "monthly" | "annual" | null;
}) {
  const router = useRouter();
  const [state, formAction] = useActionState(
    (prev: { error?: string; success?: boolean }, _formData: FormData) =>
      requestDowngrade(prev, plan, interval),
    {}
  );

  useEffect(() => {
    if (state?.success) {
      router.push("/pricing/downgrade/success");
    }
  }, [state?.success, router]);

  return (
    <form action={formAction} className="mt-4 flex flex-wrap items-center gap-3">
      <input type="hidden" name="plan" value={plan} />
      {interval && <input type="hidden" name="interval" value={interval} />}
      <button
        type="submit"
        className="inline-flex items-center justify-center rounded-lg border border-amber-500 bg-amber-50 px-4 py-2.5 text-sm font-medium text-amber-800 transition-colors hover:bg-amber-100 dark:border-amber-600 dark:bg-amber-950/50 dark:text-amber-200 dark:hover:bg-amber-900/50"
      >
        Confirm downgrade
      </button>
      <Link
        href="/pricing"
        className="inline-flex items-center justify-center rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
      >
        Cancel
      </Link>
      {state?.error && (
        <p className="w-full text-sm text-red-600 dark:text-red-400">{state.error}</p>
      )}
    </form>
  );
}
