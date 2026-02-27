/**
 * Shape for student rows from admin.students (via get_my_students RPC).
 * Add columns in Supabase and here when you extend the schema.
 */
export type Student = {
  id: string;
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  /** Optional note */
  note: string | null;
  grade: string | null;
  classroom: string | null;
  created_at: string | null;
  updated_at: string | null;
  /** Active IEP goals (from admin.student_goals where not archived) */
  goals: string[] | null;
  /** Archived IEP goals (from admin.student_goals where archived = true) */
  archived_goals: string[] | null;
};

/** Display name from first_name + last_name (handles nulls). */
export function studentDisplayName(s: Student): string {
  const first = (s.first_name ?? "").trim();
  const last = (s.last_name ?? "").trim();
  return [first, last].filter(Boolean).join(" ").trim() || "Unnamed";
}
