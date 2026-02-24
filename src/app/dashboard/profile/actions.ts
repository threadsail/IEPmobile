"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import { getCurrentUser } from "@/utils/auth";

const ALLOWED_ROLES = ["Teacher", "Aide", "Admin"] as const;

export type UpdateProfileState = { error?: string; success?: boolean };

export async function updateProfile(
  _prev: UpdateProfileState,
  formData: FormData
): Promise<UpdateProfileState> {
  const user = await getCurrentUser();
  if (!user) {
    return { error: "You must be signed in to update your profile." };
  }

  const firstName = (formData.get("first_name") as string)?.trim() ?? "";
  const lastName = (formData.get("last_name") as string)?.trim() ?? "";
  const roleRaw = (formData.get("role") as string)?.trim() ?? "";
  const role = ALLOWED_ROLES.includes(roleRaw as (typeof ALLOWED_ROLES)[number])
    ? roleRaw
    : null;
  const organizationName = (formData.get("organization_name") as string)?.trim() ?? "";

  const supabase = await createClient();

  const { error: profileError } = await supabase.rpc("update_my_profile", {
    p_first_name: firstName || null,
    p_last_name: lastName || null,
    p_role: role || null,
  });

  if (profileError) {
    return { error: profileError.message };
  }

  if (organizationName) {
    const { error: orgError } = await supabase.rpc("update_my_organization_name", {
      new_name: organizationName,
    });
    if (orgError) {
      return { error: orgError.message };
    }
  }

  revalidatePath("/dashboard/profile");
  revalidatePath("/dashboard");
  return { success: true };
}
