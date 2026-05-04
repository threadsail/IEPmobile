"use client";

import { useActionState } from "react";
import { seedTestStudents, type SeedTestStudentsState } from "./actions";

const initial: SeedTestStudentsState = { error: null };

export default function SeedTestStudentsButton() {
  const [state, formAction, pending] = useActionState(seedTestStudents, initial);

  return (
    <form action={formAction} className="mt-3 space-y-2">
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg border border-amber-300/80 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-950 transition-colors hover:bg-amber-100 disabled:opacity-50 dark:border-amber-700/60 dark:bg-amber-950/50 dark:text-amber-100 dark:hover:bg-amber-900/50"
      >
        {pending ? "Adding…" : "Add 10 test students (random names)"}
      </button>
      {state.error ? (
        <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>
      ) : null}
      {state.message ? (
        <p className="text-sm text-green-700 dark:text-green-400">{state.message}</p>
      ) : null}
    </form>
  );
}
