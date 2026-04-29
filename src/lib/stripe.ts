import Stripe from "stripe";

export type PaidPlanId = "basic" | "pro";
export type BillingInterval = "monthly" | "annual";

let stripeSingleton: Stripe | null = null;

export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error("Missing STRIPE_SECRET_KEY.");
  }
  if (!stripeSingleton) {
    stripeSingleton = new Stripe(key);
  }
  return stripeSingleton;
}

export function stripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY?.trim());
}

/**
 * Map app plan + interval to Stripe Price id (set in Stripe Dashboard, then in env).
 */
export function priceIdForPlan(
  plan: PaidPlanId,
  interval: BillingInterval
): string | undefined {
  const envMap: Record<string, string | undefined> = {
    "basic-monthly": process.env.STRIPE_PRICE_BASIC_MONTHLY,
    "basic-annual": process.env.STRIPE_PRICE_BASIC_ANNUAL,
    "pro-monthly": process.env.STRIPE_PRICE_PRO_MONTHLY,
    "pro-annual": process.env.STRIPE_PRICE_PRO_ANNUAL,
  };
  return envMap[`${plan}-${interval}`]?.trim();
}

/** True when the Price id env var exists for this plan/interval (e.g. STRIPE_PRICE_PRO_ANNUAL). */
export function stripePriceConfiguredFor(
  plan: PaidPlanId,
  interval: BillingInterval
): boolean {
  return Boolean(priceIdForPlan(plan, interval));
}

export function planAndIntervalFromPriceId(
  priceId: string
): { plan: PaidPlanId; interval: BillingInterval } | null {
  const pairs: [string, PaidPlanId, BillingInterval][] = [
    [process.env.STRIPE_PRICE_BASIC_MONTHLY ?? "", "basic", "monthly"],
    [process.env.STRIPE_PRICE_BASIC_ANNUAL ?? "", "basic", "annual"],
    [process.env.STRIPE_PRICE_PRO_MONTHLY ?? "", "pro", "monthly"],
    [process.env.STRIPE_PRICE_PRO_ANNUAL ?? "", "pro", "annual"],
  ];
  for (const [id, plan, interval] of pairs) {
    if (id && id === priceId) {
      return { plan, interval };
    }
  }
  return null;
}

/** Billing Portal configuration id (`bpc_...`) from Stripe Dashboard → Customer portal. */
export function billingPortalConfigurationId(): string | undefined {
  return process.env.STRIPE_BILLING_PORTAL_CONFIGURATION_ID?.trim();
}

export function appOrigin(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (explicit) return explicit;
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL.replace(/^https?:\/\//, "")}`;
  }
  return "http://localhost:3000";
}
