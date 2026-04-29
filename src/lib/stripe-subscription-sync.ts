import type { SupabaseClient } from "@supabase/supabase-js";
import type Stripe from "stripe";
import {
  planAndIntervalFromPriceId,
  type BillingInterval,
  type PaidPlanId,
} from "@/lib/stripe";

function mapStripePriceToPlan(
  priceId: string
): { plan: PaidPlanId; interval: BillingInterval } | null {
  return planAndIntervalFromPriceId(priceId);
}

function firstSubscriptionPriceId(sub: Stripe.Subscription): string | null {
  const item = sub.items.data[0];
  const price = item?.price;
  if (!price) return null;
  return typeof price === "string" ? price : price.id;
}

export function subscriptionToSyncArgs(sub: Stripe.Subscription): {
  plan: "starter" | PaidPlanId;
  interval: BillingInterval | null;
  periodStart: Date | null;
  periodEnd: Date | null;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
} | null {
  const status = sub.status;
  if (status === "incomplete" || status === "paused") {
    return null;
  }

  const canceled =
    status === "canceled" ||
    status === "unpaid" ||
    status === "incomplete_expired";

  if (canceled) {
    return {
      plan: "starter",
      interval: null,
      periodStart: null,
      periodEnd: null,
      stripeCustomerId:
        typeof sub.customer === "string" ? sub.customer : sub.customer?.id ?? null,
      stripeSubscriptionId: null,
    };
  }

  const priceId = firstSubscriptionPriceId(sub);
  if (!priceId) {
    return {
      plan: "starter",
      interval: null,
      periodStart: null,
      periodEnd: null,
      stripeCustomerId:
        typeof sub.customer === "string" ? sub.customer : sub.customer?.id ?? null,
      stripeSubscriptionId: null,
    };
  }

  const mapped = mapStripePriceToPlan(priceId);
  if (!mapped) {
    return {
      plan: "starter",
      interval: null,
      periodStart: null,
      periodEnd: null,
      stripeCustomerId:
        typeof sub.customer === "string" ? sub.customer : sub.customer?.id ?? null,
      stripeSubscriptionId: null,
    };
  }

  const item0 = sub.items.data[0];
  const startSec = item0?.current_period_start;
  const endSec = item0?.current_period_end;
  return {
    plan: mapped.plan,
    interval: mapped.interval,
    periodStart: startSec != null ? new Date(startSec * 1000) : null,
    periodEnd: endSec != null ? new Date(endSec * 1000) : null,
    stripeCustomerId:
      typeof sub.customer === "string" ? sub.customer : sub.customer?.id ?? null,
    stripeSubscriptionId: sub.id,
  };
}

export async function syncProfileFromStripeSubscription(
  supabase: SupabaseClient,
  userId: string,
  sub: Stripe.Subscription
): Promise<{ error: string | null }> {
  const args = subscriptionToSyncArgs(sub);
  if (!args) {
    return { error: null };
  }
  const { error } = await supabase.rpc("sync_stripe_subscription_from_webhook", {
    p_user_id: userId,
    p_plan: args.plan,
    p_interval: args.interval,
    p_period_start: args.periodStart?.toISOString() ?? null,
    p_period_end: args.periodEnd?.toISOString() ?? null,
    p_stripe_customer_id: args.stripeCustomerId,
    p_stripe_subscription_id: args.stripeSubscriptionId,
  });
  return { error: error?.message ?? null };
}
