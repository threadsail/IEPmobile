"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

function getId(formData: FormData): string | null {
  const id = formData.get("id");
  return typeof id === "string" ? id : null;
}

export async function approveAppliedData(formData: FormData) {
  const id = getId(formData);
  if (!id) return;
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from("applied_student_data")
      .update({ status: "approved", reviewed_at: new Date().toISOString(), reviewed_by: user.id })
      .eq("id", id);
  } catch {
    // Table may not exist yet
  }
  revalidatePath("/dashboard/data");
}

export async function rejectAppliedData(formData: FormData) {
  const id = getId(formData);
  if (!id) return;
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from("applied_student_data")
      .update({ status: "rejected", reviewed_at: new Date().toISOString(), reviewed_by: user.id })
      .eq("id", id);
  } catch {
    // Table may not exist yet
  }
  revalidatePath("/dashboard/data");
}
