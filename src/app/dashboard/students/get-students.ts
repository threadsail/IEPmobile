import type { SupabaseClient } from "@supabase/supabase-js";
import type { Student } from "@/types/student";

/**
 * Fetches students for the current user via RPC (reads from admin.students).
 */
export async function getStudents(
  supabase: SupabaseClient,
  _userId: string
): Promise<Student[]> {
  const { data, error } = await supabase.rpc("get_my_students");

  if (error) return [];
  return (data ?? []) as Student[];
}
