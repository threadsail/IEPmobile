"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

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

export type SubmitStudentProgressState = { error: string | null; updated?: number };

export async function submitStudentProgress(
  _prev: SubmitStudentProgressState,
  formData: FormData
): Promise<SubmitStudentProgressState> {
  const studentId = (formData.get("student_id") as string)?.trim();
  if (!studentId) {
    return { error: "Student is required." };
  }

  const summary = (formData.get("progress_text") as string)?.trim();
  if (!summary) {
    return { error: "Enter a progress or observation note." };
  }

  const loggedOnRaw = (formData.get("logged_on") as string)?.trim();
  const loggedOn = loggedOnRaw && /^\d{4}-\d{2}-\d{2}$/.test(loggedOnRaw) ? loggedOnRaw : null;

  const goalIndexRaw = formData.get("goal_index");
  let goalIndex: number | null = null;
  if (typeof goalIndexRaw === "string" && goalIndexRaw.trim() !== "") {
    const n = Number(goalIndexRaw);
    if (Number.isFinite(n) && n >= 0) {
      goalIndex = Math.floor(n);
    }
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { error: "You must be signed in." };
    }

    const { error } = await supabase.rpc("insert_student_progress_log", {
      p_student_id: studentId,
      p_logged_on: loggedOn,
      p_goal_index: goalIndex,
      p_summary: summary,
    });

    if (error) {
      const missingRpc =
        error.message.toLowerCase().includes("function") ||
        error.message.toLowerCase().includes("schema cache");
      const hint = missingRpc
        ? " Run supabase-student-progress-log.sql in the Supabase SQL Editor, then reload the API schema cache (Project Settings → API)."
        : "";
      return { error: `${error.message}${hint}` };
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Something went wrong.";
    return { error: message };
  }

  const stayOpen = (formData.get("stay_open") as string)?.trim() === "1";
  revalidatePath("/dashboard/data");
  revalidatePath("/dashboard/students");
  revalidatePath(`/dashboard/students/${studentId}`);
  if (stayOpen) {
    return { error: null, updated: Date.now() };
  }
  redirect("/dashboard/data");
}
