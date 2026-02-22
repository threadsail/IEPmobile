import type { SupabaseClient } from "@supabase/supabase-js";
import type { AppliedStudentData } from "@/types/applied-student-data";

/**
 * Fetches applied student data pending approval for the current teacher.
 * Wire to your table when ready, e.g.:
 *
 *   const { data, error } = await supabase
 *     .from("applied_student_data")
 *     .select("id, student_id, student_name, aide_id, aide_name, summary, applied_at, status")
 *     .eq("teacher_id", user.id)
 *     .eq("status", "pending")
 *     .order("applied_at", { ascending: false });
 */
export async function getPendingAppliedData(
  supabase: SupabaseClient,
  _teacherId: string
): Promise<AppliedStudentData[]> {
  // Uncomment when your table exists:
  // const { data, error } = await supabase
  //   .from("applied_student_data")
  //   .select("id, student_id, student_name, aide_id, aide_name, summary, applied_at, status")
  //   .eq("teacher_id", teacherId)
  //   .eq("status", "pending")
  //   .order("applied_at", { ascending: false });
  // if (error) return [];
  // return (data ?? []) as AppliedStudentData[];

  return [];
}
