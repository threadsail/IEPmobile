import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import {
  appOrigin,
  billingPortalConfigurationId,
  getStripe,
  stripeConfigured,
} from "@/lib/stripe";
import { getProfileWithSupabase } from "@/app/dashboard/profile/get-profile";

export const dynamic = "force-dynamic";

export async function POST() {
  if (!stripeConfigured()) {
    return NextResponse.json(
      { error: "Stripe is not configured (missing STRIPE_SECRET_KEY)." },
      { status: 503 }
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
  const customerId = profile?.stripe_customer_id ?? null;

  if (!customerId) {
    return NextResponse.json(
      {
        error: "no_customer",
        message: "No Stripe customer on file. Subscribe to a paid plan first.",
      },
      { status: 400 }
    );
  }

  const origin = appOrigin();
  const configuration = billingPortalConfigurationId();
  const portal = await getStripe().billingPortal.sessions.create({
    customer: customerId,
    ...(configuration ? { configuration } : {}),
    return_url: `${origin}/dashboard/profile`,
  });

  return NextResponse.json({ url: portal.url });
}
