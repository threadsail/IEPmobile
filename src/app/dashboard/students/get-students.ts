import type { SupabaseClient } from "@supabase/supabase-js";
import type { Student } from "@/types/student";

/**
 * Normalize goals from RPC: can be string[] (JSON), PG array string "{a,b}", or missing.
 */
function normalizeGoals(raw: unknown): string[] {
  if (Array.isArray(raw)) {
    return raw.filter((g): g is string => typeof g === "string");
  }
  if (typeof raw === "string") {
    const s = raw.trim();
    if (!s || s === "{}") return [];
    // PostgreSQL text[] sometimes returned as "{val1,val2}" or "{\"val1\",\"val2\"}"
    if (s.startsWith("{") && s.endsWith("}")) {
      const inner = s.slice(1, -1);
      if (!inner) return [];
      return inner
        .split(",")
        .map((part) => part.replace(/^"|"$/g, "").replace(/\\"/g, '"').trim())
        .filter(Boolean);
    }
    return [s];
  }
  return [];
}

/**
 * Fetches students for the current user via RPC (reads from admin.students + goals from admin.student_goals).
 */
export async function getStudents(
  supabase: SupabaseClient,
  _userId: string
): Promise<Student[]> {
  const { data, error } = await supabase.rpc("get_my_students");

  if (error) return [];
  const rows = (data ?? []) as Record<string, unknown>[];
  return rows.map((row) => ({
    ...row,
    goals: normalizeGoals(row.goals),
    archived_goals: normalizeGoals(row.archived_goals),
  })) as Student[];
}
