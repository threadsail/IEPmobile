"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export type AddStudentState = { error: string | null };

export async function addStudent(
  _prev: AddStudentState,
  formData: FormData
): Promise<AddStudentState> {
  const name = (formData.get("name") as string)?.trim();
  if (!name) {
    return { error: "Name is required." };
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

    const { error } = await supabase.from("students").insert({
      user_id: user.id,
      name,
      note,
    });

    if (error) {
      return { error: error.message };
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Something went wrong.";
    return { error: message };
  }

  revalidatePath("/dashboard/students");
  redirect("/dashboard/students");
}
