"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { parseStudentGoalReturnTo } from "./student-goal-action-return-to";

const TEST_FIRST_NAMES = [
  "Avery",
  "Riley",
  "Jordan",
  "Taylor",
  "Morgan",
  "Casey",
  "Quinn",
  "Reese",
  "Skyler",
  "River",
  "Jamie",
  "Dakota",
  "Rowan",
  "Emerson",
  "Finley",
  "Logan",
  "Parker",
  "Sage",
  "Blake",
  "Cameron",
] as const;

const TEST_LAST_NAMES = [
  "Chen",
  "Patel",
  "Garcia",
  "Nguyen",
  "Okonkwo",
  "Murphy",
  "Kim",
  "Silva",
  "Brown",
  "Martinez",
  "Anderson",
  "Thompson",
  "Lee",
  "Wright",
  "Hernandez",
  "Davis",
  "Wilson",
  "Moore",
  "Taylor",
  "Jackson",
] as const;

function randomTestName(): { first: string; last: string } {
  const first =
    TEST_FIRST_NAMES[Math.floor(Math.random() * TEST_FIRST_NAMES.length)]!;
  const last =
    TEST_LAST_NAMES[Math.floor(Math.random() * TEST_LAST_NAMES.length)]!;
  return { first, last };
}

/** RPC args for PostgREST: omit empty grade/classroom so older DBs without those params still match. */
function addStudentRpcPayload(input: {
  p_first_name: string | null;
  p_last_name: string | null;
  p_note: string | null;
  p_grade: string | null;
  p_classroom: string | null;
  p_goals: string[];
}): Record<string, string | string[] | null> {
  const grade = input.p_grade?.trim() || null;
  const classroom = input.p_classroom?.trim() || null;
  const base: Record<string, string | string[] | null> = {
    p_first_name: input.p_first_name,
    p_last_name: input.p_last_name,
    p_note: input.p_note,
    p_goals: input.p_goals,
  };
  if (grade) base.p_grade = grade;
  if (classroom) base.p_classroom = classroom;
  return base;
}

/** Same PostgREST rule as add: omit empty grade/classroom when possible. */
function updateStudentRpcPayload(input: {
  p_id: string;
  p_first_name: string | null;
  p_last_name: string | null;
  p_note: string | null;
  p_grade: string | null;
  p_classroom: string | null;
  p_goals: string[];
}): Record<string, string | string[] | null> {
  const grade = input.p_grade?.trim() || null;
  const classroom = input.p_classroom?.trim() || null;
  const base: Record<string, string | string[] | null> = {
    p_id: input.p_id,
    p_first_name: input.p_first_name,
    p_last_name: input.p_last_name,
    p_note: input.p_note,
    p_goals: input.p_goals,
  };
  if (grade) base.p_grade = grade;
  if (classroom) base.p_classroom = classroom;
  return base;
}

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

    const { data: id, error } = await supabase.rpc(
      "add_student",
      addStudentRpcPayload({
        p_first_name: firstName || null,
        p_last_name: lastName || null,
        p_note: note || null,
        p_grade: grade,
        p_classroom: classroom,
        p_goals: goals,
      })
    );

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

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/students");
  redirect("/dashboard/students");
}

export type SeedTestStudentsState = { error: string | null; message?: string };

/** Adds 10 students with random names for the signed-in user. Enabled in development or when ALLOW_SEED_TEST_STUDENTS=true. */
export async function seedTestStudents(
  _prev: SeedTestStudentsState,
  _formData: FormData
): Promise<SeedTestStudentsState> {
  void _prev;
  void _formData;
  const allowed =
    process.env.NODE_ENV === "development" ||
    process.env.ALLOW_SEED_TEST_STUDENTS === "true";
  if (!allowed) {
    return {
      error:
        "Test student seeding is disabled. Run in development or set ALLOW_SEED_TEST_STUDENTS=true.",
    };
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { error: "You must be signed in." };
    }

    let remaining = 10;
    while (remaining > 0) {
      remaining -= 1;
      const { first, last } = randomTestName();
      const { error } = await supabase.rpc(
        "add_student",
        addStudentRpcPayload({
          p_first_name: first,
          p_last_name: last,
          p_note: "Test roster (seeded)",
          p_grade: null,
          p_classroom: null,
          p_goals: [],
        })
      );
      if (error) {
        return { error: error.message };
      }
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Something went wrong.";
    return { error: message };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/students");
  revalidatePath("/dashboard/data");
  revalidatePath("/dashboard/schedule");
  return { error: null, message: "Added 10 test students with random names." };
}

export type UpdateStudentState = { error: string | null; updated?: number };

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
  let goals: string[];
  if (formData.has("goals_text")) {
    const block = (formData.get("goals_text") as string) ?? "";
    goals = block
      .split(/\r?\n/)
      .map((g) => g.trim())
      .filter(Boolean);
  } else {
    const goalsRaw = formData.getAll("goals");
    goals = (Array.isArray(goalsRaw) ? goalsRaw : [goalsRaw])
      .map((g) => (typeof g === "string" ? g : "").trim())
      .filter(Boolean);
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { error: "You must be signed in to update a student." };
    }

    const { error } = await supabase.rpc(
      "update_student",
      updateStudentRpcPayload({
        p_id: id,
        p_first_name: firstName || null,
        p_last_name: lastName,
        p_note: note,
        p_grade: grade,
        p_classroom: classroom,
        p_goals: goals,
      })
    );

    if (error) {
      return { error: error.message };
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Something went wrong.";
    return { error: message };
  }

  const stayOpen = (formData.get("stay_open") as string)?.trim() === "1";
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/students");
  revalidatePath(`/dashboard/students/${id}`);
  revalidatePath("/dashboard/data");
  if (stayOpen) {
    return { error: null, updated: Date.now() };
  }
  const returnTo = parseStudentGoalReturnTo(formData.get("return_to"));
  if (returnTo) {
    redirect(returnTo);
  }
  redirect(`/dashboard/students/${id}`);
}

export type BulkUpdateStudentsState = { error: string | null };

/** Upper bound on row_count from the client (abuse guard). */
const BULK_EDIT_MAX_ROWS = 10_000;

export async function bulkUpdateStudents(
  _prev: BulkUpdateStudentsState,
  formData: FormData
): Promise<BulkUpdateStudentsState> {
  const countRaw = formData.get("row_count");
  const parsed = Number(typeof countRaw === "string" ? countRaw : "");
  const count = Number.isFinite(parsed)
    ? Math.max(0, Math.min(Math.floor(parsed), BULK_EDIT_MAX_ROWS))
    : 0;
  if (count === 0) {
    return { error: "No students to update." };
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { error: "You must be signed in." };
    }

    const errors: string[] = [];

    for (let i = 0; i < count; i++) {
      const id = (formData.get(`s_${i}_id`) as string)?.trim();
      if (!id) {
        errors.push(`Row ${i + 1}: missing student.`);
        continue;
      }

      const firstName = (formData.get(`s_${i}_first_name`) as string)?.trim();
      const lastName = (formData.get(`s_${i}_last_name`) as string)?.trim() || null;
      if (!firstName && !lastName) {
        errors.push(
          `Row ${i + 1}: first name or last name is required (${id.slice(0, 8)}…).`
        );
        continue;
      }

      const note = (formData.get(`s_${i}_note`) as string)?.trim() || null;
      const grade = (formData.get(`s_${i}_grade`) as string)?.trim() || null;
      const classroom = (formData.get(`s_${i}_classroom`) as string)?.trim() || null;
      const goalsBlock = (formData.get(`s_${i}_goals`) as string) ?? "";
      const goals = goalsBlock
        .split(/\r?\n/)
        .map((g) => g.trim())
        .filter(Boolean);

      const { error } = await supabase.rpc(
        "update_student",
        updateStudentRpcPayload({
          p_id: id,
          p_first_name: firstName || null,
          p_last_name: lastName,
          p_note: note,
          p_grade: grade,
          p_classroom: classroom,
          p_goals: goals,
        })
      );

      if (error) {
        const label =
          [firstName, lastName].filter(Boolean).join(" ").trim() || id.slice(0, 8);
        errors.push(`${label}: ${error.message}`);
      }
    }

    if (errors.length > 0) {
      return { error: errors.join(" — ") };
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Something went wrong.";
    return { error: message };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/students");
  revalidatePath("/dashboard/students/bulk-edit");
  for (let i = 0; i < count; i++) {
    const id = (formData.get(`s_${i}_id`) as string)?.trim();
    if (id) revalidatePath(`/dashboard/students/${id}`);
  }
  revalidatePath("/dashboard/data");
  revalidatePath("/dashboard/schedule");
  redirect("/dashboard/students");
}

export type ArchiveStudentGoalState = { error: string | null; updated?: number };

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

  const stayOpen = (formData.get("stay_open") as string)?.trim() === "1";
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/students");
  revalidatePath(`/dashboard/students/${id}`);
  revalidatePath("/dashboard/data");
  if (stayOpen) {
    return { error: null, updated: Date.now() };
  }
  const returnTo = parseStudentGoalReturnTo(formData.get("return_to"));
  const target = returnTo ?? `/dashboard/students/${id}`;
  redirect(target);
}

export type UnarchiveStudentGoalState = { error: string | null; updated?: number };

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

  const stayOpen = (formData.get("stay_open") as string)?.trim() === "1";
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/students");
  revalidatePath(`/dashboard/students/${id}`);
  revalidatePath("/dashboard/data");
  if (stayOpen) {
    return { error: null, updated: Date.now() };
  }
  const returnTo = parseStudentGoalReturnTo(formData.get("return_to"));
  const target = returnTo ?? `/dashboard/students/${id}`;
  redirect(target);
}

export type ArchiveStudentRecordState = { error: string | null };

export async function archiveStudentRecord(
  _prev: ArchiveStudentRecordState,
  formData: FormData
): Promise<ArchiveStudentRecordState> {
  const id = (formData.get("id") as string)?.trim();
  if (!id) {
    return { error: "Student ID is required." };
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { error: "You must be signed in." };
    }

    const { error } = await supabase.rpc("archive_student", { p_id: id });

    if (error) {
      return { error: error.message };
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Something went wrong.";
    return { error: message };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/students");
  revalidatePath(`/dashboard/students/${id}`);
  revalidatePath(`/dashboard/students/${id}/edit`);
  revalidatePath("/dashboard/data");
  revalidatePath("/dashboard/schedule");
  redirect("/dashboard/students");
}

export type UnarchiveStudentRecordState = { error: string | null };

export async function unarchiveStudentRecord(
  _prev: UnarchiveStudentRecordState,
  formData: FormData
): Promise<UnarchiveStudentRecordState> {
  const id = (formData.get("id") as string)?.trim();
  if (!id) {
    return { error: "Student ID is required." };
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { error: "You must be signed in." };
    }

    const { error } = await supabase.rpc("unarchive_student", { p_id: id });

    if (error) {
      return { error: error.message };
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Something went wrong.";
    return { error: message };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/students");
  revalidatePath(`/dashboard/students/${id}`);
  revalidatePath("/dashboard/data");
  revalidatePath("/dashboard/schedule");
  redirect(`/dashboard/students/${id}`);
}

export type DeleteStudentRecordState = { error: string | null };

export async function deleteStudentRecord(
  _prev: DeleteStudentRecordState,
  formData: FormData
): Promise<DeleteStudentRecordState> {
  const id = (formData.get("id") as string)?.trim();
  if (!id) {
    return { error: "Student ID is required." };
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { error: "You must be signed in." };
    }

    const { error } = await supabase.rpc("delete_student", { p_id: id });

    if (error) {
      return { error: error.message };
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Something went wrong.";
    return { error: message };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/students");
  revalidatePath(`/dashboard/students/${id}`);
  revalidatePath(`/dashboard/students/${id}/edit`);
  revalidatePath("/dashboard/data");
  revalidatePath("/dashboard/schedule");
  redirect("/dashboard/students");
}
