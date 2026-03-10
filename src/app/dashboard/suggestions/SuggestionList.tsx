"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toggleUpvoteForm, updateSuggestionStatus } from "./actions";
import type { SuggestionWithMeta, SuggestionStatus } from "./get-suggestions";

const STATUSES: { value: SuggestionStatus; label: string }[] = [
  { value: "suggested", label: "Suggested" },
  { value: "approved", label: "Approved" },
  { value: "in_progress", label: "In progress" },
  { value: "testing", label: "Testing" },
  { value: "completed", label: "Completed" },
];

const STATUS_ORDER: SuggestionStatus[] = ["suggested", "approved", "in_progress", "testing", "completed"];

type CategoryFilter = "all" | SuggestionStatus;

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return "";
  }
}

function StatusBar({ status }: { status: SuggestionStatus }) {
  const index = STATUS_ORDER.indexOf(status);
  const isCompleted = status === "completed";
  const completedClass = isCompleted
    ? "bg-blue-500/25 text-blue-800 dark:bg-blue-400/25 dark:text-blue-200"
    : "bg-emerald-500/25 text-emerald-800 dark:bg-emerald-400/25 dark:text-emerald-200";
  const incompleteClass = "bg-zinc-100 text-zinc-500 dark:bg-zinc-700 dark:text-zinc-400";
  const currentDarkerCompleted = isCompleted
    ? "bg-blue-500/40 text-blue-800 dark:bg-blue-400/40 dark:text-blue-200"
    : "bg-emerald-500/40 text-emerald-800 dark:bg-emerald-400/40 dark:text-emerald-200";
  const currentDarkerIncomplete = "bg-zinc-200 text-zinc-600 dark:bg-zinc-600 dark:text-zinc-300";
  return (
    <div className="flex w-full overflow-hidden rounded-md border border-zinc-200 dark:border-zinc-600">
      {STATUSES.map(({ label }, i) => {
        const completed = i <= index;
        const isCurrent = i === index;
        const baseClass = completed ? completedClass : incompleteClass;
        const currentClass = completed ? currentDarkerCompleted : currentDarkerIncomplete;
        return (
          <div
            key={label}
            className={`flex-1 py-1.5 text-center text-xs ${isCurrent ? "font-bold" : "font-medium"} ${
              isCurrent ? currentClass : baseClass
            } ${isCurrent ? "rounded border-2 border-zinc-400/60 dark:border-zinc-400/50" : ""}`}
            style={{ minWidth: 0 }}
          >
            {label}
          </div>
        );
      })}
    </div>
  );
}

const FILTER_OPTIONS: { value: CategoryFilter; label: string }[] = [
  { value: "all", label: "All" },
  ...STATUSES,
];

export default function SuggestionList({
  suggestions,
  isSuperadmin,
}: {
  suggestions: SuggestionWithMeta[];
  isSuperadmin: boolean;
}) {
  const router = useRouter();
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");
  const [testCategoryId, setTestCategoryId] = useState<string | null>(null);
  const [statusOverrides, setStatusOverrides] = useState<Record<string, SuggestionStatus>>({});
  const showCategoryControl = (suggestionId: string) =>
    isSuperadmin || testCategoryId === suggestionId;

  const getStatus = (s: SuggestionWithMeta) => statusOverrides[s.id] ?? s.status;

  useEffect(() => {
    setStatusOverrides((prev) => {
      const next = { ...prev };
      for (const id of Object.keys(next)) {
        const s = suggestions.find((x) => x.id === id);
        if (s && s.status === next[id]) delete next[id];
      }
      return next;
    });
  }, [suggestions]);

  async function handleStatusChange(suggestionId: string, newStatus: string) {
    const status = newStatus as SuggestionStatus;
    setStatusOverrides((prev) => ({ ...prev, [suggestionId]: status }));
    await updateSuggestionStatus(suggestionId, newStatus);
    router.refresh();
  }

  const filteredSuggestions =
    categoryFilter === "all"
      ? suggestions
      : suggestions.filter((s) => getStatus(s) === categoryFilter);

  if (suggestions.length === 0) {
    return (
      <p className="rounded-lg border border-zinc-200 bg-zinc-50/50 py-8 text-center text-sm text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900/30 dark:text-zinc-400">
        No suggestions yet. Be the first to share an idea!
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
          Category:
        </span>
        {FILTER_OPTIONS.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            onClick={() => setCategoryFilter(value)}
            className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
              categoryFilter === value
                ? "border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-400 dark:bg-blue-900/30 dark:text-blue-200"
                : "border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      <ul className="space-y-4">
      {filteredSuggestions.map((s) => {
        const isCompleted = getStatus(s) === "completed";
        return (
        <li
          key={s.id}
          className={`flex flex-col gap-3 rounded-xl border p-4 ${
            isCompleted
              ? "border-blue-200 bg-blue-50/80 dark:border-blue-800/50 dark:bg-blue-950/30"
              : "border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-800/50"
          }`}
        >
          <StatusBar status={getStatus(s)} />
          <p className="text-sm text-zinc-900 dark:text-zinc-100 whitespace-pre-wrap">
            {s.content}
          </p>
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-zinc-100 pt-3 dark:border-zinc-700">
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              {s.author_name} · {formatDate(s.created_at)}
            </span>
            <div className="flex flex-wrap items-center gap-2">
              {showCategoryControl(s.id) ? (
                <select
                  value={getStatus(s)}
                  onChange={(e) => handleStatusChange(s.id, e.target.value)}
                  className="rounded-lg border border-zinc-300 bg-white px-2.5 py-1.5 text-xs text-zinc-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-200 dark:focus:border-blue-400 dark:focus:ring-blue-400"
                >
                  {STATUSES.map(({ value, label }) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              ) : (
                <button
                  type="button"
                  onClick={() => setTestCategoryId((id) => (id === s.id ? null : s.id))}
                  className="rounded-lg border border-zinc-300 bg-zinc-100 px-2.5 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-200 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-600"
                >
                  Test: Change category
                </button>
              )}
              <form action={toggleUpvoteForm} className="inline-flex items-center gap-1.5">
                <input type="hidden" name="suggestion_id" value={s.id} />
                <button
                  type="submit"
                  className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-sm font-medium transition-colors ${
                    s.has_upvoted
                      ? "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200"
                      : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-600"
                  }`}
                  aria-pressed={s.has_upvoted}
                >
                  <svg
                    className="h-4 w-4"
                    fill={s.has_upvoted ? "currentColor" : "none"}
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6.633 10.25c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 0 1 2.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 0 0 .322-1.672V2.75a.75.75 0 0 1 .75-.75 2.25 2.25 0 0 1 2.25 2.25c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282m0 0h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 0 1-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 0 0-1.423-.23h-.777M2.331 10.727a11.969 11.969 0 0 0 3.58 2.624 1.213 1.213 0 0 1-.465 2.315 13.483 13.483 0 0 1-4.49-.99 1.213 1.213 0 0 1-.465-2.315 11.969 11.969 0 0 0 3.58-2.624"
                    />
                  </svg>
                  {s.upvote_count}
                </button>
              </form>
            </div>
          </div>
        </li>
        );
      })}
      </ul>
      {filteredSuggestions.length === 0 && (
        <p className="rounded-lg border border-zinc-200 bg-zinc-50/50 py-6 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:bg-zinc-900/30 dark:text-zinc-400">
          No suggestions in this category.
        </p>
      )}
    </div>
  );
}
