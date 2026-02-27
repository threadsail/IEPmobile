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
  const grade = (formData.get("grade") as string)?.trim() || null;
  const classroom = (formData.get("classroom") as string)?.trim() || null;
  const goalsRaw = formData.getAll("goals");
  const goals = (Array.isArray(goalsRaw) ? goalsRaw : [goalsRaw])
    .map((g) => (typeof g === "string" ? g : "").trim())
    .filter(Boolean);

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
      p_grade: grade || null,
      p_classroom: classroom || null,
      p_goals: goals,
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

export type UpdateStudentState = { error: string | null };

export async function updateStudent(
  _prev: UpdateStudentState,
  formData: FormData
): Promise<UpdateStudentState> {
  const id = (formData.get("id") as string)?.trim();
  if (!id) {
    return { error: "Student ID is required." };
  }

  const firstName = (formData.get("first_name") as string)?.trim();
  const lastName = (formData.get("last_name") as string)?.trim() || null;
  if (!firstName && !lastName) {
    return { error: "First name or last name is required." };
  }

  const note = (formData.get("note") as string)?.trim() || null;
  const grade = (formData.get("grade") as string)?.trim() || null;
  const classroom = (formData.get("classroom") as string)?.trim() || null;
  const goalsRaw = formData.getAll("goals");
  const goals = (Array.isArray(goalsRaw) ? goalsRaw : [goalsRaw])
    .map((g) => (typeof g === "string" ? g : "").trim())
    .filter(Boolean);

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { error: "You must be signed in to update a student." };
    }

    const { error } = await supabase.rpc("update_student", {
      p_id: id,
      p_first_name: firstName || null,
      p_last_name: lastName || null,
      p_note: note || null,
      p_grade: grade || null,
      p_classroom: classroom || null,
      p_goals: goals,
    });

    if (error) {
      return { error: error.message };
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Something went wrong.";
    return { error: message };
  }

  revalidatePath("/dashboard/students");
  revalidatePath(`/dashboard/students/${id}`);
  redirect(`/dashboard/students/${id}`);
}

export type ArchiveStudentGoalState = { error: string | null };

export async function archiveStudentGoal(
  prevOrFormData: ArchiveStudentGoalState | FormData,
  formDataArg?: FormData
): Promise<ArchiveStudentGoalState> {
  const formData =
    formDataArg instanceof FormData ? formDataArg : (prevOrFormData as FormData);
  const id = (formData.get("id") as string)?.trim();
  if (!id) {
    return { error: "Student ID is required." };
  }

  const archiveIndexRaw = formData.get("archive_index") as string | null;
  const archiveIndex = archiveIndexRaw ? Number(archiveIndexRaw) : NaN;
  if (!Number.isFinite(archiveIndex) || archiveIndex < 0) {
    return { error: "Invalid goal index." };
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { error: "You must be signed in to archive a goal." };
    }

    const { error } = await supabase.rpc("archive_student_goal_by_index", {
      p_student_id: id,
      p_goal_index: Math.floor(archiveIndex),
    });

    if (error) {
      return { error: error.message };
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Something went wrong.";
    return { error: message };
  }

  revalidatePath("/dashboard/students");
  revalidatePath(`/dashboard/students/${id}`);
  redirect(`/dashboard/students/${id}`);
}

export type UnarchiveStudentGoalState = { error: string | null };

export async function unarchiveStudentGoal(
  prevOrFormData: UnarchiveStudentGoalState | FormData,
  formDataArg?: FormData
): Promise<UnarchiveStudentGoalState> {
  const formData =
    formDataArg instanceof FormData ? formDataArg : (prevOrFormData as FormData);
  const id = (formData.get("id") as string)?.trim();
  if (!id) {
    return { error: "Student ID is required." };
  }

  const indexRaw = formData.get("unarchive_index") as string | null;
  const index = indexRaw ? Number(indexRaw) : NaN;
  if (!Number.isFinite(index) || index < 0) {
    return { error: "Invalid index." };
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { error: "You must be signed in to unarchive a goal." };
    }

    const { error } = await supabase.rpc("unarchive_student_goal_by_index", {
      p_student_id: id,
      p_archived_goal_index: Math.floor(index),
    });

    if (error) {
      return { error: error.message };
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Something went wrong.";
    return { error: message };
  }

  revalidatePath("/dashboard/students");
  revalidatePath(`/dashboard/students/${id}`);
  redirect(`/dashboard/students/${id}`);
}
