"use client";

import { useMemo } from "react";
import { studentDisplayName, type Student } from "@/types/student";

export default function StudentList({
  students,
  filterActive = false,
  onSelectStudent,
}: {
  students: Student[];
  filterActive?: boolean;
  onSelectStudent: (student: Student) => void;
}) {
  const sortedByName = useMemo(() => {
    if (students.length === 0) return [];
    return [...students].sort((a, b) =>
      studentDisplayName(a).localeCompare(studentDisplayName(b), undefined, {
        sensitivity: "base",
      })
    );
  }, [students]);

  if (students.length === 0) {
    return (
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        {filterActive
          ? "No students in this classroom. Choose another filter or clear the filter to see everyone."
          : "No students yet. Add a student above to get started."}
      </p>
    );
  }

  return (
    <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3">
      {sortedByName.map((student) => (
        <li key={student.id} className="min-w-0">
          <button
            type="button"
            onClick={() => onSelectStudent(student)}
            className="w-full truncate rounded-lg border border-zinc-200/80 bg-white/70 px-3 py-2.5 text-left text-sm font-medium text-pink-600 shadow-sm transition-colors hover:border-pink-200 hover:bg-white dark:border-zinc-700/50 dark:bg-zinc-900/60 dark:text-pink-400 dark:hover:border-pink-800 dark:hover:bg-zinc-900/80"
          >
            {studentDisplayName(student)}
          </button>
        </li>
      ))}
    </ul>
  );
}
