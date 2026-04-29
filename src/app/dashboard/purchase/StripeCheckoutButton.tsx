"use client";

import { useState } from "react";

type PlanId = "basic" | "pro";
type Interval = "monthly" | "annual";

export default function StripeCheckoutButton({
  plan,
  interval,
  disabled,
}: {
  plan: PlanId;
  interval: Interval;
  disabled?: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, interval }),
      });
      const data = (await res.json()) as {
        url?: string;
        error?: string;
        message?: string;
      };
      if (!res.ok) {
        if (res.status === 409 && data.message) {
          setError(data.message);
          return;
        }
        setError(data.error ?? data.message ?? "Checkout could not start.");
        return;
      }
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      setError("No checkout URL returned.");
    } catch {
      setError("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-4">
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled || loading}
        className="rounded-md bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Redirecting to Stripe…" : "Subscribe with Stripe"}
      </button>
      {error && (
        <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
      {error?.includes("active subscription") && (
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Use “Manage billing” on your profile to change or cancel your plan in Stripe.
        </p>
      )}
    </div>
  );
}
