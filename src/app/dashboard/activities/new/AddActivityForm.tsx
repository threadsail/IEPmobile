"use client";

import Link from "next/link";
import { useState } from "react";
import { useFormState } from "react-dom";
import { createActivity } from "../actions";

const inputClass =
  "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 placeholder-zinc-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-400 dark:focus:border-purple-400 dark:focus:ring-purple-400";
const labelClass = "mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300";

type ActivityMode = "create" | "youtube";

export default function AddActivityForm() {
  const [mode, setMode] = useState<ActivityMode>("create");
  const [state, formAction] = useFormState(createActivity, { error: null });

  return (
    <div className="space-y-5">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setMode("create")}
          className={`flex-1 rounded-lg border-2 px-4 py-2.5 text-sm font-medium transition-colors ${
            mode === "create"
              ? "border-purple-500 bg-purple-500/20 text-purple-800 dark:border-purple-400 dark:bg-purple-400/20 dark:text-purple-200"
              : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:border-zinc-500"
          }`}
        >
          Create activity
        </button>
        <button
          type="button"
          onClick={() => setMode("youtube")}
          className={`flex-1 rounded-lg border-2 px-4 py-2.5 text-sm font-medium transition-colors ${
            mode === "youtube"
              ? "border-purple-500 bg-purple-500/20 text-purple-800 dark:border-purple-400 dark:bg-purple-400/20 dark:text-purple-200"
              : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:border-zinc-500"
          }`}
        >
          YouTube activity
        </button>
      </div>

      <form action={formAction} className="space-y-5">
        <input type="hidden" name="activity_type" value={mode} />

        {state?.error ? (
          <div
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-950/40 dark:text-red-200"
          >
            {state.error}
          </div>
        ) : null}

        <div>
          <label htmlFor="name" className={labelClass}>
            Name <span className="text-red-500">*</span>
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            maxLength={200}
            placeholder={mode === "youtube" ? "e.g. Math tutorial" : "e.g. Reading practice"}
            className={inputClass}
          />
        </div>

        {mode === "youtube" && (
          <div>
            <label htmlFor="youtube_url" className={labelClass}>
              YouTube URL <span className="text-red-500">*</span>
            </label>
            <input
              id="youtube_url"
              name="youtube_url"
              type="url"
              required
              placeholder="https://www.youtube.com/watch?v=..."
              className={inputClass}
            />
          </div>
        )}

        <div>
          <label htmlFor="description" className={labelClass}>
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows={3}
            maxLength={500}
            placeholder="Optional short description or category"
            className={inputClass}
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            type="submit"
            className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600"
          >
            {mode === "youtube" ? "Add YouTube activity" : "Add activity"}
          </button>
          <Link
            href="/dashboard/activities"
            className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
