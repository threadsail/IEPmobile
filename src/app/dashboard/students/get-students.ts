import type { SupabaseClient } from "@supabase/supabase-js";
import type { Student } from "@/types/student";

/**
 * Fetches students for the current user (teacher).
 * Wire to your students table when ready, e.g.:
 *
 *   const { data, error } = await supabase
 *     .from("students")
 *     .select("id, user_id, name, note, created_at, updated_at")
 *     .eq("user_id", userId)
 *     .order("name");
 */
export async function getStudents(
  supabase: SupabaseClient,
  userId: string
): Promise<Student[]> {
  // Uncomment when your students table exists:
  // const { data, error } = await supabase
  //   .from("students")
  //   .select("id, user_id, name, note, created_at, updated_at")
  //   .eq("user_id", userId)
  //   .order("name");
  // if (error) return [];
  // return (data ?? []) as Student[];

  return [];
}
