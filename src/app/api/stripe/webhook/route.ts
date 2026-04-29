import { headers } from "next/headers";
import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { syncProfileFromStripeSubscription } from "@/lib/stripe-subscription-sync";
import { createServiceRoleClient } from "@/utils/supabase/admin";

export const dynamic = "force-dynamic";

async function resolveUserIdForSubscription(
  supabase: ReturnType<typeof createServiceRoleClient>,
  sub: Stripe.Subscription
): Promise<string | null> {
  const meta = sub.metadata?.supabase_user_id;
  if (meta) return meta;

  const customerId =
    typeof sub.customer === "string" ? sub.customer : sub.customer?.id;
  if (!customerId) return null;

  const { data, error } = await supabase.rpc("admin_user_id_by_stripe_customer", {
    p_customer_id: customerId,
  });
  if (error || !data) return null;
  return data as string;
}

export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "STRIPE_WEBHOOK_SECRET is not configured." },
      { status: 500 }
    );
  }

  const rawBody = await request.text();
  const headerList = await headers();
  const sig = headerList.get("stripe-signature");
  if (!sig) {
    return NextResponse.json({ error: "Missing stripe-signature." }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(rawBody, sig, secret);
  } catch {
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  const supabase = createServiceRoleClient();
  const stripe = getStripe();

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode !== "subscription") break;

        const userId =
          session.client_reference_id ?? session.metadata?.supabase_user_id ?? null;
        const subRef = session.subscription;
        if (!userId || !subRef) break;

        const subId = typeof subRef === "string" ? subRef : subRef.id;
        const sub = await stripe.subscriptions.retrieve(subId);
        const { error } = await syncProfileFromStripeSubscription(supabase, userId, sub);
        if (error) {
          console.error("sync after checkout:", error);
          return NextResponse.json({ received: true, syncError: error }, { status: 500 });
        }
        break;
      }
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const userId = await resolveUserIdForSubscription(supabase, sub);
        if (!userId) {
          console.warn("Stripe webhook: could not resolve user for subscription", sub.id);
          break;
        }
        const { error } = await syncProfileFromStripeSubscription(supabase, userId, sub);
        if (error) {
          console.error("sync subscription event:", error);
          return NextResponse.json({ received: true, syncError: error }, { status: 500 });
        }
        break;
      }
      default:
        break;
    }
  } catch (err) {
    console.error("Stripe webhook handler error:", err);
    return NextResponse.json({ error: "Handler failed." }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
