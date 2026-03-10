"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import { getCurrentUser } from "@/utils/auth";

type PlanId = "starter" | "basic" | "pro";

export type TestApplySubscriptionState = { error?: string; success?: boolean };

/**
 * Test-only: applies the given plan/interval to the current user via RPC
 * (avoids direct admin schema access). Sets period start/end for paid plans.
 */
export async function testApplySubscription(
  _prev: TestApplySubscriptionState,
  plan: PlanId,
  interval: "monthly" | "annual" | null
): Promise<TestApplySubscriptionState> {
  const user = await getCurrentUser();
  if (!user) {
    return { error: "You must be signed in." };
  }

  const supabase = await createClient();

  const { error } = await supabase.rpc("test_apply_subscription", {
    p_plan: plan,
    p_interval: interval,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/purchase");
  revalidatePath("/dashboard/profile");
  revalidatePath("/pricing");
  revalidatePath("/pricing/select");
  return { success: true };
}
