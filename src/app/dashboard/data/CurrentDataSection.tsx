"use client";

import { useEffect, useMemo, useState } from "react";
import StudentProgressDataModal from "./StudentProgressDataModal";
import { studentDisplayName, type Student } from "@/types/student";

export default function CurrentDataSection({ students }: { students: Student[] }) {
  const [detailStudent, setDetailStudent] = useState<Student | null>(null);

  useEffect(() => {
    setDetailStudent((prev) => {
      if (!prev) return prev;
      const next = students.find((s) => s.id === prev.id);
      return next ?? prev;
    });
  }, [students]);

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
        No students yet. Add students from the Students tab to log progress here.
      </p>
    );
  }

  return (
    <>
      <StudentProgressDataModal student={detailStudent} onClose={() => setDetailStudent(null)} />
      <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3">
        {sortedByName.map((student) => (
          <li key={student.id} className="min-w-0">
            <button
              type="button"
              onClick={() => setDetailStudent(student)}
              className="w-full truncate rounded-lg border border-zinc-200/80 bg-white/70 px-3 py-2.5 text-left text-sm font-medium text-orange-600 shadow-sm transition-colors hover:border-orange-200 hover:bg-white dark:border-zinc-700/50 dark:bg-zinc-900/60 dark:text-orange-400 dark:hover:border-orange-800 dark:hover:bg-zinc-900/80"
            >
              {studentDisplayName(student)}
            </button>
          </li>
        ))}
      </ul>
    </>
  );
}
