"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Activity } from "@/types/activity";

type SortOption = "popularity" | "recent";

function sortActivities(activities: Activity[], sort: SortOption): Activity[] {
  const copy = [...activities];
  if (sort === "recent") {
    copy.sort((a, b) => {
      const aAt = a.created_at ? new Date(a.created_at).getTime() : 0;
      const bAt = b.created_at ? new Date(b.created_at).getTime() : 0;
      return bAt - aAt;
    });
  } else {
    copy.sort((a, b) => {
      const aCount = a.usage_count ?? 0;
      const bCount = b.usage_count ?? 0;
      return bCount - aCount;
    });
  }
  return copy;
}

export default function ActivitiesList({ activities }: { activities: Activity[] }) {
  const [sort, setSort] = useState<SortOption>("recent");
  const sorted = useMemo(() => sortActivities(activities, sort), [activities, sort]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
            Sort:
          </span>
          <button
            type="button"
            onClick={() => setSort("popularity")}
            className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
              sort === "popularity"
                ? "border-purple-500 bg-purple-500/20 text-purple-700 dark:border-purple-400 dark:bg-purple-400/20 dark:text-purple-300"
                : "border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
            }`}
          >
            Popularity
          </button>
          <button
            type="button"
            onClick={() => setSort("recent")}
            className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
              sort === "recent"
                ? "border-purple-500 bg-purple-500/20 text-purple-700 dark:border-purple-400 dark:bg-purple-400/20 dark:text-purple-300"
                : "border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
            }`}
          >
            Recent
          </button>
        </div>
        <Link
          href="/dashboard/activities/new"
          className="inline-flex items-center gap-1.5 rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600"
        >
          <span aria-hidden>+</span>
          Add activity
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3">
        {sorted.map((activity) => (
          <article
            key={activity.id}
            className="flex aspect-square flex-col items-center justify-center rounded-xl border border-zinc-200/80 bg-white/70 p-4 shadow-sm transition-colors hover:border-purple-200 hover:bg-white dark:border-zinc-700/50 dark:bg-zinc-900/60 dark:hover:border-purple-800 dark:hover:bg-zinc-900/80"
          >
            {activity.icon ? (
              <span className="mb-2 text-2xl md:text-3xl" aria-hidden>
                {activity.icon}
              </span>
            ) : activity.activity_type === "youtube" ? (
              <span className="mb-2 text-2xl md:text-3xl" aria-hidden>
                ▶
              </span>
            ) : null}
            <h2 className="text-center text-sm font-semibold text-zinc-900 line-clamp-2 dark:text-zinc-100 md:text-base">
              {activity.name}
            </h2>
            {activity.description ? (
              <p className="mt-1 text-center text-xs text-zinc-500 line-clamp-2 dark:text-zinc-400">
                {activity.description}
              </p>
            ) : null}
            {activity.youtube_url ? (
              <a
                href={activity.youtube_url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 text-xs text-purple-600 underline dark:text-purple-400"
              >
                Watch
              </a>
            ) : null}
          </article>
        ))}
      </div>
    </div>
  );
}
