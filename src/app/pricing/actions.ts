"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import { getCurrentUser } from "@/utils/auth";

type PlanId = "starter" | "basic" | "pro";

export type RequestDowngradeState = { error?: string; success?: boolean };

export async function requestDowngrade(
  _prev: RequestDowngradeState,
  plan: PlanId,
  interval: "monthly" | "annual" | null
): Promise<RequestDowngradeState> {
  const user = await getCurrentUser();
  if (!user) {
    return { error: "You must be signed in to request a downgrade." };
  }

  const supabase = await createClient();

  const { error } = await supabase.rpc("request_subscription_downgrade", {
    p_plan: plan,
    p_interval: interval,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/pricing");
  revalidatePath("/pricing/select");
  revalidatePath("/pricing/downgrade");
  revalidatePath("/pricing/downgrade/success");
  revalidatePath("/dashboard/profile");
  return { success: true };
}
