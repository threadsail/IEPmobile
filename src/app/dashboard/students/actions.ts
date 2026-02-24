"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export type AddStudentState = { error: string | null };

export async function addStudent(
  _prev: AddStudentState,
  formData: FormData
): Promise<AddStudentState> {
  const firstName = (formData.get("first_name") as string)?.trim();
  const lastName = (formData.get("last_name") as string)?.trim() || null;
  if (!firstName && !lastName) {
    return { error: "First name or last name is required." };
  }

  const note = (formData.get("note") as string)?.trim() || null;

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { error: "You must be signed in to add a student." };
    }

    const { data: id, error } = await supabase.rpc("add_student", {
      p_first_name: firstName || null,
      p_last_name: lastName || null,
      p_note: note || null,
    });

    if (error) {
      return { error: error.message };
    }
    if (id == null) {
      return { error: "Failed to add student." };
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Something went wrong.";
    return { error: message };
  }

  revalidatePath("/dashboard/students");
  redirect("/dashboard/students");
}
