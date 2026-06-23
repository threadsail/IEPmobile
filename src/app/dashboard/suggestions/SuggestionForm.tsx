"use client";

import { useActionState } from "react";
import { NO_AUTOFILL } from "@/constants/form-autocomplete";
import { createSuggestion } from "./actions";

const inputClass =
  "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 placeholder-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-400 dark:focus:border-blue-400 dark:focus:ring-blue-400";
const labelClass = "mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300";

export default function SuggestionForm() {
  const [state, formAction] = useActionState(
    async (_: unknown, formData: FormData) => {
      return createSuggestion(formData);
    },
    null as { error?: string; success?: boolean } | null
  );

  if (state?.success) {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800 dark:border-green-800 dark:bg-green-950/40 dark:text-green-200">
        Thanks! Your suggestion was posted.
      </div>
    );
  }

  return (
    <form action={formAction} autoComplete={NO_AUTOFILL} className="space-y-3">
      {state?.error ? (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-950/40 dark:text-red-200"
        >
          {state.error}
        </div>
      ) : null}
      <div>
        <label htmlFor="suggestion-content" className={labelClass}>
          Your suggestion
        </label>
        <textarea
          id="suggestion-content"
          name="content"
          required
          rows={3}
          maxLength={2000}
          placeholder="Share an idea for the product..."
          className={inputClass}
          autoComplete={NO_AUTOFILL}
        />
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">Max 2000 characters</p>
      </div>
      <button
        type="submit"
        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
      >
        Post suggestion
      </button>
    </form>
  );
}
