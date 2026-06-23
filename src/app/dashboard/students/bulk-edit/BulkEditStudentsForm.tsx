"use client";

import Link from "next/link";
import { useActionState } from "react";
import { NO_AUTOFILL } from "@/constants/form-autocomplete";
import { studentDisplayName, type Student } from "@/types/student";
import { bulkUpdateStudents } from "../actions";

const cellInputClass =
  "w-full min-w-[5.5rem] rounded-md border border-zinc-300 bg-white px-2 py-1.5 text-sm text-zinc-900 placeholder-zinc-500 focus:border-pink-500 focus:outline-none focus:ring-1 focus:ring-pink-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-400 dark:focus:border-pink-400 dark:focus:ring-pink-400";

export default function BulkEditStudentsForm({ students }: { students: Student[] }) {
  const [state, formAction] = useActionState(bulkUpdateStudents, { error: null });

  return (
    <form action={formAction} autoComplete={NO_AUTOFILL} className="space-y-4">
      <input type="hidden" name="row_count" value={students.length} />

      {state?.error ? (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-950/40 dark:text-red-200"
        >
          {state.error}
        </div>
      ) : null}

      <div className="-mx-1 overflow-x-auto rounded-lg border border-zinc-200/80 dark:border-zinc-700/50">
        <table className="w-full min-w-[56rem] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-200 bg-zinc-50/90 dark:border-zinc-700 dark:bg-zinc-900/80">
              <th scope="col" className="sticky left-0 z-[1] whitespace-nowrap bg-zinc-50/95 px-2 py-2 font-medium text-zinc-700 dark:bg-zinc-900/95 dark:text-zinc-300">
                Roster
              </th>
              <th scope="col" className="px-2 py-2 font-medium text-zinc-700 dark:text-zinc-300">
                First name
              </th>
              <th scope="col" className="px-2 py-2 font-medium text-zinc-700 dark:text-zinc-300">
                Last name
              </th>
              <th scope="col" className="px-2 py-2 font-medium text-zinc-700 dark:text-zinc-300">
                Grade
              </th>
              <th scope="col" className="px-2 py-2 font-medium text-zinc-700 dark:text-zinc-300">
                Classroom
              </th>
              <th scope="col" className="min-w-[8rem] px-2 py-2 font-medium text-zinc-700 dark:text-zinc-300">
                Note
              </th>
              <th scope="col" className="min-w-[12rem] px-2 py-2 font-medium text-zinc-700 dark:text-zinc-300">
                IEP goals <span className="font-normal text-zinc-500">(one per line)</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {students.map((student, i) => (
              <tr
                key={student.id}
                className="border-b border-zinc-100 last:border-0 dark:border-zinc-800/80"
              >
                <td className="sticky left-0 z-[1] whitespace-nowrap bg-white/95 px-2 py-2 align-top text-xs text-zinc-600 dark:bg-zinc-950/95 dark:text-zinc-400">
                  <span className="font-medium text-zinc-800 dark:text-zinc-200">
                    {studentDisplayName(student)}
                  </span>
                  <input type="hidden" name={`s_${i}_id`} value={student.id} />
                </td>
                <td className="px-2 py-2 align-top">
                  <input
                    name={`s_${i}_first_name`}
                    type="text"
                    maxLength={200}
                    className={cellInputClass}
                    autoComplete={NO_AUTOFILL}
                    defaultValue={student.first_name ?? ""}
                    aria-label={`First name, ${studentDisplayName(student)}`}
                  />
                </td>
                <td className="px-2 py-2 align-top">
                  <input
                    name={`s_${i}_last_name`}
                    type="text"
                    maxLength={200}
                    className={cellInputClass}
                    autoComplete={NO_AUTOFILL}
                    defaultValue={student.last_name ?? ""}
                    aria-label={`Last name, ${studentDisplayName(student)}`}
                  />
                </td>
                <td className="px-2 py-2 align-top">
                  <input
                    name={`s_${i}_grade`}
                    type="text"
                    maxLength={50}
                    className={cellInputClass}
                    autoComplete={NO_AUTOFILL}
                    defaultValue={student.grade ?? ""}
                    aria-label={`Grade, ${studentDisplayName(student)}`}
                  />
                </td>
                <td className="px-2 py-2 align-top">
                  <input
                    name={`s_${i}_classroom`}
                    type="text"
                    maxLength={100}
                    className={cellInputClass}
                    autoComplete={NO_AUTOFILL}
                    defaultValue={student.classroom ?? ""}
                    aria-label={`Classroom, ${studentDisplayName(student)}`}
                  />
                </td>
                <td className="px-2 py-2 align-top">
                  <input
                    name={`s_${i}_note`}
                    type="text"
                    maxLength={500}
                    className={cellInputClass}
                    autoComplete={NO_AUTOFILL}
                    defaultValue={student.note ?? ""}
                    aria-label={`Note, ${studentDisplayName(student)}`}
                  />
                </td>
                <td className="px-2 py-2 align-top">
                  <textarea
                    name={`s_${i}_goals`}
                    rows={3}
                    maxLength={8000}
                    className={`${cellInputClass} min-h-[4.5rem] resize-y font-mono text-xs leading-snug`}
                    autoComplete={NO_AUTOFILL}
                    defaultValue={(student.goals ?? []).join("\n")}
                    aria-label={`IEP goals, ${studentDisplayName(student)}`}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center gap-3 pt-2">
        <button
          type="submit"
          className="rounded-lg bg-pink-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-pink-700 dark:bg-pink-500 dark:hover:bg-pink-600"
        >
          Save all changes
        </button>
        <Link
          href="/dashboard/students"
          className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
