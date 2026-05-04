"use client";

import { useActionState } from "react";
import { studentDisplayName, type Student } from "@/types/student";
import { unarchiveStudentRecord } from "./actions";

function ArchivedRow({ student }: { student: Student }) {
  const [state, formAction] = useActionState(unarchiveStudentRecord, { error: null });
  const archivedLabel =
    student.archived_at != null && student.archived_at !== ""
      ? new Date(student.archived_at).toLocaleDateString(undefined, {
          dateStyle: "medium",
        })
      : null;

  return (
    <li className="rounded-lg border border-zinc-200/80 bg-zinc-50/80 px-4 py-3 dark:border-zinc-700/50 dark:bg-zinc-900/40">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 flex-1">
          <p className="font-medium text-zinc-900 dark:text-zinc-100">
            {studentDisplayName(student)}
          </p>
          {archivedLabel ? (
            <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
              Archived {archivedLabel}
            </p>
          ) : null}
          {student.note ? (
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{student.note}</p>
          ) : null}
        </div>
        <form action={formAction} className="shrink-0">
          <input type="hidden" name="id" value={student.id} />
          <button
            type="submit"
            className="rounded-lg border border-pink-500 bg-pink-500/10 px-4 py-2 text-sm font-medium text-pink-800 transition-colors hover:bg-pink-500/20 dark:border-pink-400 dark:bg-pink-400/10 dark:text-pink-200 dark:hover:bg-pink-400/20"
          >
            Restore to roster
          </button>
        </form>
      </div>
      {state?.error ? (
        <p className="mt-2 text-sm text-red-700 dark:text-red-300" role="alert">
          {state.error}
        </p>
      ) : null}
    </li>
  );
}

export default function ArchivedStudentList({ students }: { students: Student[] }) {
  if (students.length === 0) {
    return (
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        No archived students. Use Edit student → Archive when you need to hide someone without
        deleting their record.
      </p>
    );
  }

  return (
    <ul className="space-y-2">
      {students.map((student) => (
        <ArchivedRow key={student.id} student={student} />
      ))}
    </ul>
  );
}
