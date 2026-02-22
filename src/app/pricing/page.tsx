"use client";

import { useState } from "react";

const PLANS = {
  starter: { monthly: 0, annual: 0 },
  basic: { monthly: 19, annual: 190 }, // 10 months price (2 months free)
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

export default function PricingPage() {
  const [isAnnual, setIsAnnual] = useState(false);

  return (
    <div className="w-full space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-semibold tracking-tight">Pricing Plans</h1>
        <p className="mt-2 text-lg text-zinc-900 dark:text-zinc-400">
          Choose the plan that works best for you.
        </p>

        {/* Monthly / Annual toggle */}
        
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

      <div className="grid gap-6 md:grid-cols-3">
        {/* Starter Plan */}
        <div className="rounded-lg border bg-white/70 p-6 shadow-sm dark:bg-zinc-900/60">
          <div className="mb-4">
            <h3 className="text-xl font-semibold">Starter</h3>
            <div className="mt-2">
              <span className="text-3xl font-bold">Free</span>
            </div>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Perfect for getting started
            </p>
          </div>
          <ul className="mb-6 space-y-3">
            <li className="flex items-start gap-2">
              <CheckIcon />
              <span className="text-sm">One Teacher and Aide</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckIcon />
              <span className="text-sm">Base features</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckIcon />
              <span className="text-sm">Email support</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckIcon />
              <span className="text-sm">Up to 5 Data points per student</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckIcon />
              <span className="text-sm">CSV upload</span>
            </li>
          </ul>
          <button className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700">
            Select
          </button>
        </div>

        {/* Basic Plan - Featured */}
        <div className="rounded-lg border bg-white/70 p-6 shadow-lg dark:bg-zinc-900/60">
          <div className="mb-4">
            <h3 className="text-xl font-semibold">Basic</h3>
            <div className="mt-2 flex flex-wrap items-baseline gap-1">
              <span className="text-3xl font-bold">
                ${isAnnual ? PLANS.basic.annual : PLANS.basic.monthly}
              </span>
              <span className="text-zinc-600 dark:text-zinc-400">
                {isAnnual ? "/year" : "/month"}
              </span>
              {isAnnual && (
                <span className="text-sm text-zinc-500 dark:text-zinc-400">
                  (${(PLANS.basic.annual / 12).toFixed(0)}/mo)
                </span>
              )}

            </div>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Best for growing teams
            </p>
          </div>
          <ul className="mb-6 space-y-3">
            <li className="flex items-start gap-2">
              <CheckIcon />
              <span className="text-sm">Two Teachers and 6 Aides</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckIcon />
              <span className="text-sm">Advanced features</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckIcon />
              <span className="text-sm">Priority support</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckIcon />
              <span className="text-sm">Up to 10 Data points per student</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckIcon />
              <span className="text-sm">API access</span>
            </li>
          </ul>
          <button className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700">
            Select
          </button>
        </div>

        {/* Pro Plan */}
        <div className="rounded-lg border bg-white/70 p-6 shadow-sm dark:bg-zinc-900/60">
          <div className="mb-4">
            <h3 className="text-xl font-semibold">Pro</h3>
            <div className="mt-2 flex flex-wrap items-baseline gap-1">
              <span className="text-3xl font-bold">
                ${isAnnual ? PLANS.pro.annual : PLANS.pro.monthly}
              </span>
              <span className="text-zinc-600 dark:text-zinc-400">
                {isAnnual ? "/year" : "/month"}
              </span>
              {isAnnual && (
                <span className="text-sm text-zinc-500 dark:text-zinc-400">
                  (${(PLANS.pro.annual / 12).toFixed(0)}/mo)
                </span>
              )}
            </div>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              For large organizations
            </p>
          </div>
          <ul className="mb-6 space-y-3">
            <li className="flex items-start gap-2">
              <CheckIcon />
              <span className="text-sm">Unlimited Teachers and Aides</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckIcon />
              <span className="text-sm">All features</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckIcon />
              <span className="text-sm">24/7 dedicated support</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckIcon />
              <span className="text-sm">Unlimited Data points per student</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckIcon />
              <span className="text-sm">Custom integrations</span>
            </li>
          </ul>
          <button className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700">
            Select
          </button>
        </div>
      </div>
    </div>
  );
}
