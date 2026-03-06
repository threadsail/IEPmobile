"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Activity } from "@/types/activity";

type SortOption = "popularity" | "recent";

/** Extract YouTube video ID from common URL formats. Returns null if not a valid YouTube URL. */
function getYoutubeVideoId(url: string | null | undefined): string | null {
  if (!url?.trim()) return null;
  const s = url.trim();
  try {
    if (s.includes("youtube.com/watch?v=")) {
      const u = new URL(s);
      return u.searchParams.get("v");
    }
    if (s.includes("youtu.be/")) {
      const u = new URL(s);
      return u.pathname.slice(1).split("/")[0] || null;
    }
    if (s.includes("youtube.com/embed/")) {
      const match = s.match(/embed\/([a-zA-Z0-9_-]{11})/);
      return match?.[1] ?? null;
    }
  } catch {
    return null;
  }
  return null;
}

/** Thumbnail URL for an activity: image_url, or YouTube thumbnail from youtube_url, or null. */
function getActivityThumbnailUrl(activity: Activity): string | null {
  if (activity.image_url?.trim()) return activity.image_url.trim();
  const videoId = getYoutubeVideoId(activity.youtube_url);
  if (videoId) return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
  return null;
}

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
        {sorted.map((activity) => {
          const thumbnailUrl = getActivityThumbnailUrl(activity);
          return (
          <article
            key={activity.id}
            className="flex aspect-square flex-col overflow-hidden rounded-xl border border-zinc-200/80 bg-white/70 shadow-sm transition-colors hover:border-purple-200 hover:bg-white dark:border-zinc-700/50 dark:bg-zinc-900/60 dark:hover:border-purple-800 dark:hover:bg-zinc-900/80"
          >
            <div className="relative aspect-video w-full shrink-0 bg-zinc-100 dark:bg-zinc-800">
              {thumbnailUrl ? (
                <>
                  <img
                    src={thumbnailUrl}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                  {activity.youtube_url && (
                    <div
                      className="absolute inset-0 flex items-center justify-center bg-black/20"
                      aria-hidden
                    >
                      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-red-600/90 text-white shadow">
                        <svg className="h-6 w-6 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </span>
                    </div>
                  )}
                </>
              ) : (
                <div
                  className="flex h-full w-full items-center justify-center bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/40 dark:to-purple-800/40"
                  aria-hidden
                >
                  {activity.icon ? (
                    <span className="text-4xl md:text-5xl">{activity.icon}</span>
                  ) : activity.activity_type === "youtube" ? (
                    <svg
                      className="h-12 w-12 text-purple-600 dark:text-purple-400"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden
                    >
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  ) : (
                    <svg
                      className="h-12 w-12 text-purple-600 dark:text-purple-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                      aria-hidden
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.38 8.98a3 3 0 00-4.243-4.243m3.38 8.98a9 9 0 10-12.72 0" />
                    </svg>
                  )}
                </div>
              )}
            </div>
            <div className="flex flex-1 flex-col items-center justify-center p-3">
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
            </div>
          </article>
          );
        })}
      </div>
    </div>
  );
}
