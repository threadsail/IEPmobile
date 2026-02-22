"use client";

import Link from "next/link";
import { useFormState } from "react-dom";
import { addStudent } from "./actions";

const inputClass =
  "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 placeholder-zinc-500 focus:border-pink-500 focus:outline-none focus:ring-1 focus:ring-pink-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-400 dark:focus:border-pink-400 dark:focus:ring-pink-400";
const labelClass = "mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300";

export default function AddStudentForm() {
  const [state, formAction] = useFormState(addStudent, { error: null });

  return (
    <form action={formAction} className="space-y-4">
      {state?.error ? (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-950/40 dark:text-red-200"
        >
          {state.error}
        </div>
      ) : null}

      <div>
        <label htmlFor="student-name" className={labelClass}>
          Name <span className="text-red-500">*</span>
        </label>
        <input
          id="student-name"
          name="name"
          type="text"
          required
          maxLength={200}
          placeholder="e.g. Alex Smith"
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="student-note" className={labelClass}>
          Note
        </label>
        <input
          id="student-note"
          name="note"
          type="text"
          maxLength={500}
          placeholder="Optional grade level or note"
          className={inputClass}
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          className="rounded-lg bg-pink-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-pink-700 dark:bg-pink-500 dark:hover:bg-pink-600"
        >
          Add student
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
