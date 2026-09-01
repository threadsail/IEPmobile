import type { SupabaseClient } from "@supabase/supabase-js";
import type { StudentProgressLog } from "@/types/student-progress-log";

function normalizeLog(row: Record<string, unknown>): StudentProgressLog {
  return {
    id: String(row.id ?? ""),
    student_id: String(row.student_id ?? ""),
    logged_on: String(row.logged_on ?? ""),
    goal_index:
      row.goal_index == null || row.goal_index === ""
        ? null
        : Number(row.goal_index),
    objective_index:
      row.objective_index == null || row.objective_index === ""
        ? null
        : Number(row.objective_index),
    summary: String(row.summary ?? ""),
    created_at: String(row.created_at ?? ""),
  };
}

export async function getStudentProgressLogs(
  supabase: SupabaseClient,
  studentId: string,
  goalIndex?: number | null
): Promise<StudentProgressLog[]> {
  const { data, error } = await supabase.rpc("get_student_progress_logs", {
    p_student_id: studentId,
    p_goal_index: goalIndex ?? null,
  });

  if (error) return [];
  const rows = (data ?? []) as Record<string, unknown>[];
  return rows.map(normalizeLog);
}
