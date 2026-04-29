import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import {
  appOrigin,
  getStripe,
  priceIdForPlan,
  stripeConfigured,
  type PaidPlanId,
  type BillingInterval,
} from "@/lib/stripe";
import { getProfileWithSupabase } from "@/app/dashboard/profile/get-profile";

export const dynamic = "force-dynamic";

type Body = {
  plan?: string;
  interval?: string;
};

export async function POST(request: Request) {
  if (!stripeConfigured()) {
    return NextResponse.json(
      { error: "Stripe is not configured (missing STRIPE_SECRET_KEY)." },
      { status: 503 }
    );
  }

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const plan = body.plan;
  const interval = body.interval;

  if (plan === "starter") {
    return NextResponse.json(
      { error: "Starter does not require checkout." },
      { status: 400 }
    );
  }

  if (plan !== "basic" && plan !== "pro") {
    return NextResponse.json({ error: "Invalid plan." }, { status: 400 });
  }

  if (interval !== "monthly" && interval !== "annual") {
    return NextResponse.json({ error: "Invalid billing interval." }, { status: 400 });
  }

  const paidPlan = plan as PaidPlanId;
  const billingInterval = interval as BillingInterval;

  const priceId = priceIdForPlan(paidPlan, billingInterval);
  if (!priceId) {
    return NextResponse.json(
      {
        error:
          "Missing Stripe Price id for this plan. Set STRIPE_PRICE_BASIC_MONTHLY (etc.) in the environment.",
      },
      { status: 500 }
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "You must be signed in." }, { status: 401 });
  }

  const profile = await getProfileWithSupabase(supabase, user.id);
  const stripeSubId = profile?.stripe_subscription_id ?? null;
  const stripeCustomerId = profile?.stripe_customer_id ?? null;

  if (stripeSubId) {
    try {
      const existing = await getStripe().subscriptions.retrieve(stripeSubId);
      const active =
        existing.status === "active" ||
        existing.status === "trialing" ||
        existing.status === "past_due";
      if (active) {
        return NextResponse.json(
          {
            error: "active_subscription",
            message:
              "You already have an active subscription. Use billing management to change plans.",
          },
          { status: 409 }
        );
      }
    } catch {
      // Stale id in DB; allow new checkout
    }
  }

  const origin = appOrigin();
  const successUrl = `${origin}/dashboard/purchase/success?session_id={CHECKOUT_SESSION_ID}`;
  const cancelUrl = `${origin}/dashboard/purchase?plan=${paidPlan}&interval=${billingInterval}`;

  const session = await getStripe().checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: successUrl,
    cancel_url: cancelUrl,
    client_reference_id: user.id,
    customer_email: stripeCustomerId ? undefined : user.email ?? undefined,
    customer: stripeCustomerId ?? undefined,
    allow_promotion_codes: true,
    subscription_data: {
      metadata: {
        supabase_user_id: user.id,
      },
    },
    metadata: {
      supabase_user_id: user.id,
      plan: paidPlan,
      interval: billingInterval,
    },
  });

  if (!session.url) {
    return NextResponse.json(
      { error: "Could not create Checkout session." },
      { status: 500 }
    );
  }

  return NextResponse.json({ url: session.url });
}
