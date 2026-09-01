"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import { getCurrentUser } from "@/utils/auth";

const ALLOWED_ROLES = ["Teacher", "Aide", "Admin"] as const;

export type UpdateProfileState = { error?: string; success?: boolean };
export type JoinOrganizationState = { error: string | null; success: boolean };

export async function joinOrganizationAsAide(
  _prev: JoinOrganizationState,
  formData: FormData
): Promise<JoinOrganizationState> {
  const user = await getCurrentUser();
  if (!user) {
    return { error: "You must be signed in to join a team.", success: false };
  }

  const inviteCode = (formData.get("invite_code") as string)?.trim() ?? "";
  if (!inviteCode) {
    return { error: "Invite code is required.", success: false };
  }

  const supabase = await createClient();
  const { data: ok, error } = await supabase.rpc("join_organization_as_aide", {
    p_invite_code: inviteCode,
  });

  if (error) {
    return { error: error.message, success: false };
  }
  if (!ok) {
    return { error: "Invalid invite code. Check with your teacher and try again.", success: false };
  }

  revalidatePath("/dashboard/profile");
  revalidatePath("/dashboard/schedule");
  return { error: null, success: true };
}

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
