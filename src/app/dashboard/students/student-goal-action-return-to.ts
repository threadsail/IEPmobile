export type StudentGoalActionReturnTo = "/dashboard/students" | "/dashboard/data";

const ALLOWED = new Set<StudentGoalActionReturnTo>(["/dashboard/students", "/dashboard/data"]);

export function parseStudentGoalReturnTo(raw: unknown): StudentGoalActionReturnTo | null {
  const t = typeof raw === "string" ? raw.trim() : "";
  if (!t) return null;
  return ALLOWED.has(t as StudentGoalActionReturnTo) ? (t as StudentGoalActionReturnTo) : null;
}
