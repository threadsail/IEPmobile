"use client";

import Link from "next/link";
import { useState } from "react";

export const PLANS = {
  starter: { monthly: 0, annual: 0 },
  basic: { monthly: 19, annual: 190 },
  pro: { monthly: 39, annual: 390 },
} as const;

const CheckIcon = () => (
  <svg
    className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-500"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M5 13l4 4L19 7"
    />
  </svg>
);

export type PlanId = keyof typeof PLANS;

type PricingPlansProps = {
  /** Logged-in user's current plan; null when not logged in. */
  currentPlan: PlanId | null;
  /** Logged-in user's billing interval (basic/pro). null = monthly for display. */
  currentInterval?: "monthly" | "annual" | null;
};

export default function PricingPlans({ currentPlan, currentInterval = null }: PricingPlansProps) {
  const [isAnnual, setIsAnnual] = useState(false);
  const isCurrentPlanAndInterval = (id: PlanId, intervalIsAnnual: boolean) => {
    if (currentPlan !== id) return false;
    if (id === "starter") return true;
    return (currentInterval === "annual") === intervalIsAnnual;
  };

  const planIdToLabel: Record<PlanId, string> = {
    starter: "Starter",
    basic: "Basic",
    pro: "Pro",
  };

  function PlanCard({
    id,
    title,
    price,
    period,
    perMonth,
    description,
    features,
    featured,
    intervalIsAnnual,
  }: {
    id: PlanId;
    title: string;
    price: number;
    period: string;
    perMonth?: string;
    description: string;
    features: string[];
    featured?: boolean;
    intervalIsAnnual: boolean;
  }) {
    const isCurrent = isCurrentPlanAndInterval(id, intervalIsAnnual);
    return (
      <div
        className={`rounded-lg border bg-white/70 p-6 shadow-sm dark:bg-zinc-900/60 ${
          featured ? "shadow-lg" : ""
        } ${isCurrent ? "ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-zinc-900" : ""}`}
      >
        <div className="mb-4">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-xl font-semibold">{title}</h3>
            {isCurrent && (
              <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900/50 dark:text-blue-200">
                Your plan
                {id !== "starter" && (
                  <span className="ml-1">({intervalIsAnnual ? "Annual" : "Monthly"})</span>
                )}
              </span>
            )}
          </div>
          <div className="mt-2 flex flex-wrap items-baseline gap-1">
            <span className="text-3xl font-bold">
              {price === 0 ? "Free" : `$${price}`}
            </span>
            {price > 0 && (
              <>
                <span className="text-zinc-600 dark:text-zinc-400">{period}</span>
                {perMonth && (
                  <span className="text-sm text-zinc-500 dark:text-zinc-400">
                    {perMonth}
                  </span>
                )}
              </>
            )}
          </div>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            {description}
          </p>
        </div>
        <ul className="mb-6 space-y-3">
          {features.map((f) => (
            <li key={f} className="flex items-start gap-2">
              <CheckIcon />
              <span className="text-sm">{f}</span>
            </li>
          ))}
        </ul>
        {isCurrent ? (
          null
        ) : (
          <Link
            href={
              currentPlan !== null
                ? `/dashboard/purchase?plan=${id}${id !== "starter" ? `&interval=${intervalIsAnnual ? "annual" : "monthly"}` : ""}`
                : "/auth"
            }
            className="block w-full rounded-md bg-blue-600 px-4 py-2 text-center text-sm font-medium text-white transition-colors hover:bg-blue-700"
          >
            Select
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="w-full space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-semibold tracking-tight">Pricing Plans</h1>
        <p className="mt-2 text-lg text-zinc-900 dark:text-zinc-400">
          {currentPlan
            ? `You're on the ${planIdToLabel[currentPlan]}${currentPlan !== "starter" && currentInterval ? ` (${currentInterval === "annual" ? "Annual" : "Monthly"})` : ""} plan.`
            : "Choose the plan that works best for you."}
        </p>

        <div className="mt-6 flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => setIsAnnual(false)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              !isAnnual
                ? "bg-blue-600 text-white"
                : "bg-zinc-200 text-zinc-600 hover:bg-zinc-300 dark:bg-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-600"
            }`}
          >
            Monthly
          </button>
          <button
            type="button"
            onClick={() => setIsAnnual(true)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              isAnnual
                ? "bg-blue-600 text-white"
                : "bg-zinc-200 text-zinc-600 hover:bg-zinc-300 dark:bg-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-600"
            }`}
          >
            Annual
          </button>
        </div>
      </div>

      <div
        className={
          isAnnual
            ? "grid grid-cols-1 gap-6 md:grid-cols-[0.5fr_1fr_1fr_0.5fr]"
            : "grid gap-6 md:grid-cols-3"
        }
      >
        {!isAnnual && (
          <PlanCard
            id="starter"
            title="Starter"
            price={0}
            period=""
            description="Perfect for getting started"
            features={[
              "One Teacher and Aide",
              "Base features",
              "Email support",
              "Up to 5 Data points per student",
              "CSV upload",
            ]}
            intervalIsAnnual={false}
          />
        )}
        {isAnnual && <div className="hidden md:block" aria-hidden="true" />}
        <PlanCard
          id="basic"
          title="Basic"
          price={isAnnual ? PLANS.basic.annual : PLANS.basic.monthly}
          period={isAnnual ? "/year" : "/month"}
          perMonth={
            isAnnual ? `($${(PLANS.basic.annual / 12).toFixed(0)}/mo)` : undefined
          }
          description="Best for growing teams"
          features={[
            "Two Teachers and 6 Aides",
            "Advanced features",
            "Priority support",
            "Up to 10 Data points per student",
            "API access",
          ]}
          featured
          intervalIsAnnual={isAnnual}
        />
        <PlanCard
          id="pro"
          title="Pro"
          price={isAnnual ? PLANS.pro.annual : PLANS.pro.monthly}
          period={isAnnual ? "/year" : "/month"}
          perMonth={
            isAnnual ? `($${(PLANS.pro.annual / 12).toFixed(0)}/mo)` : undefined
          }
          description="For large organizations"
          features={[
            "Unlimited Teachers and Aides",
            "All features",
            "24/7 dedicated support",
            "Unlimited Data points per student",
            "Custom integrations",
          ]}
          intervalIsAnnual={isAnnual}
        />
        {isAnnual && <div className="hidden md:block" aria-hidden="true" />}
      </div>
    </div>
  );
}
