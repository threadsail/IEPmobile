import type { Student } from "@/types/student";

/** Distinct non-empty classroom values from the active roster, sorted for display. */
export function classroomsFromStudents(students: Student[]): string[] {
  const seen = new Set<string>();
  for (const s of students) {
    const c = s.classroom?.trim();
    if (c) seen.add(c);
  }
  return [...seen].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
}
