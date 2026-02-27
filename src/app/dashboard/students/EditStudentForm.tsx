"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import type { Student } from "@/types/student";
import { updateStudent } from "./actions";

const inputClass =
  "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 placeholder-zinc-500 focus:border-pink-500 focus:outline-none focus:ring-1 focus:ring-pink-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-400 dark:focus:border-pink-400 dark:focus:ring-pink-400";
const labelClass = "mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300";

export default function EditStudentForm({ student }: { student: Student }) {
  const [state, formAction] = useActionState(updateStudent, { error: null });
  const initialGoals = student.goals?.length ? student.goals : [""];
  const [goalFields, setGoalFields] = useState<string[]>(initialGoals);

  function addGoalField() {
    setGoalFields((prev) => [...prev, ""]);
  }

  function removeGoalField(index: number) {
    setGoalFields((prev) => prev.filter((_, i) => i !== index));
  }

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="id" value={student.id} />

      {state?.error ? (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-950/40 dark:text-red-200"
        >
          {state.error}
        </div>
      ) : null}

      <div>
        <label htmlFor="edit-first-name" className={labelClass}>
          First name <span className="text-red-500">*</span>
        </label>
        <input
          id="edit-first-name"
          name="first_name"
          type="text"
          required
          maxLength={200}
          placeholder="e.g. Alex"
          className={inputClass}
          defaultValue={student.first_name ?? ""}
        />
      </div>

      <div>
        <label htmlFor="edit-last-name" className={labelClass}>
          Last name
        </label>
        <input
          id="edit-last-name"
          name="last_name"
          type="text"
          maxLength={200}
          placeholder="e.g. Smith"
          className={inputClass}
          defaultValue={student.last_name ?? ""}
        />
      </div>

      <div>
        <label htmlFor="edit-grade" className={labelClass}>
          Grade
        </label>
        <input
          id="edit-grade"
          name="grade"
          type="text"
          maxLength={50}
          placeholder="e.g. 3rd"
          className={inputClass}
          defaultValue={student.grade ?? ""}
        />
      </div>

      <div>
        <label htmlFor="edit-classroom" className={labelClass}>
          Classroom
        </label>
        <input
          id="edit-classroom"
          name="classroom"
          type="text"
          maxLength={100}
          placeholder="e.g. Room 12"
          className={inputClass}
          defaultValue={student.classroom ?? ""}
        />
      </div>

      <div>
        <label htmlFor="edit-note" className={labelClass}>
          Note
        </label>
        <input
          id="edit-note"
          name="note"
          type="text"
          maxLength={500}
          placeholder="Optional note"
          className={inputClass}
          defaultValue={student.note ?? ""}
        />
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between gap-2">
          <label className={labelClass}>IEP goals</label>
          <button
            type="button"
            onClick={addGoalField}
            className="rounded-lg border border-pink-500 bg-pink-500/10 px-3 py-1.5 text-sm font-medium text-pink-700 transition-colors hover:bg-pink-500/20 dark:border-pink-400 dark:bg-pink-400/10 dark:text-pink-300 dark:hover:bg-pink-400/20"
          >
            + Add goal
          </button>
        </div>
        <div className="space-y-2">
          {goalFields.map((value, i) => (
            <div key={i} className="flex gap-2">
              <input
                name="goals"
                type="text"
                maxLength={500}
                placeholder={`IEP goal ${i + 1}`}
                className={`${inputClass} flex-1`}
                defaultValue={value}
              />
              {i > 0 ? (
                <button
                  type="button"
                  onClick={() => removeGoalField(i)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-zinc-300 bg-white text-xs font-semibold text-zinc-500 hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                  aria-label={`Remove IEP goal ${i + 1}`}
                >
                  ×
                </button>
              ) : null}
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          className="rounded-lg bg-pink-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-pink-700 dark:bg-pink-500 dark:hover:bg-pink-600"
        >
          Save changes
        </button>
        <Link
          href={`/dashboard/students/${student.id}`}
          className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
