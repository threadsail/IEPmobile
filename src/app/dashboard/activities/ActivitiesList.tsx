"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useTransition } from "react";
import type { Activity } from "@/types/activity";
import type { ScheduleRosterMember } from "@/types/schedule";
import type { ActivityFilter } from "./get-activities";
import { toggleActivityUpvote } from "./actions";
import AddActivityToScheduleForm from "./AddActivityToScheduleForm";
import ActivityPopupImage from "@/components/ActivityPopupImage";
import YoutubeActivityEmbed from "@/components/YoutubeActivityEmbed";
import {
  ACTIVITY_DEFAULT_IMAGE_URL,
  getActivityPopupImageCandidates,
  getActivityThumbnailUrl,
  getYoutubeVideoId,
} from "@/utils/youtube-activity";

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

type Props = {
  activities: Activity[];
  currentFilter: ActivityFilter;
  roster: ScheduleRosterMember[];
  currentUserId: string | null;
};

export default function ActivitiesList({
  activities,
  currentFilter,
  roster,
  currentUserId,
}: Props) {
  const [sort, setSort] = useState<SortOption>("recent");
  const [isPending, startTransition] = useTransition();
  const [openActivity, setOpenActivity] = useState<Activity | null>(null);
  const sorted = useMemo(() => sortActivities(activities, sort), [activities, sort]);

  useEffect(() => {
    if (!openActivity) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenActivity(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openActivity]);

  const openYoutubeId = openActivity ? getYoutubeVideoId(openActivity.youtube_url) : null;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
          Show:
        </span>
        <Link
          href="/dashboard/activities?filter=org"
          className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
            currentFilter === "org"
              ? "border-purple-500 bg-purple-500/20 text-purple-700 dark:border-purple-400 dark:bg-purple-400/20 dark:text-purple-300 md:border-zinc-800 md:bg-zinc-100 md:text-zinc-900 dark:md:border-zinc-600 dark:md:bg-zinc-800 dark:md:text-zinc-100"
              : "border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
          }`}
        >
          My organization
        </Link>
        <Link
          href="/dashboard/activities?filter=mine"
          className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
            currentFilter === "mine"
              ? "border-purple-500 bg-purple-500/20 text-purple-700 dark:border-purple-400 dark:bg-purple-400/20 dark:text-purple-300 md:border-zinc-800 md:bg-zinc-100 md:text-zinc-900 dark:md:border-zinc-600 dark:md:bg-zinc-800 dark:md:text-zinc-100"
              : "border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
          }`}
        >
          Only mine
        </Link>
      </div>
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
                ? "border-purple-500 bg-purple-500/20 text-purple-700 dark:border-purple-400 dark:bg-purple-400/20 dark:text-purple-300 md:border-zinc-800 md:bg-zinc-100 md:text-zinc-900 dark:md:border-zinc-600 dark:md:bg-zinc-800 dark:md:text-zinc-100"
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
                ? "border-purple-500 bg-purple-500/20 text-purple-700 dark:border-purple-400 dark:bg-purple-400/20 dark:text-purple-300 md:border-zinc-800 md:bg-zinc-100 md:text-zinc-900 dark:md:border-zinc-600 dark:md:bg-zinc-800 dark:md:text-zinc-100"
                : "border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
            }`}
          >
            Recent
          </button>
        </div>
        <Link
          href="/dashboard/activities/new"
          className="inline-flex items-center gap-1.5 rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600 md:bg-zinc-800 md:hover:bg-zinc-900 dark:md:bg-zinc-700 dark:md:hover:bg-zinc-600"
        >
          <span aria-hidden>+</span>
          Add activity
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3">
        {sorted.map((activity) => {
          const thumbnailUrl = getActivityThumbnailUrl(activity);
          const isDefaultThumbnail = thumbnailUrl === ACTIVITY_DEFAULT_IMAGE_URL;
          return (
          <article
            key={activity.id}
            className="flex h-[248px] flex-col overflow-hidden rounded-xl border border-zinc-200/80 bg-white/70 shadow-sm transition-colors hover:border-purple-200 hover:bg-white sm:h-[260px] dark:border-zinc-700/50 dark:bg-zinc-900/60 dark:hover:border-purple-800 dark:hover:bg-zinc-900/80 md:h-[268px] md:rounded-lg md:shadow-none md:hover:border-zinc-300 dark:md:hover:border-zinc-600"
          >
            <button
              type="button"
              onClick={() => setOpenActivity(activity)}
              className="flex min-h-0 flex-1 flex-col text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-500"
              aria-label={`Open details: ${activity.name}`}
            >
              <div
                className={`relative min-h-0 w-full flex-1 ${
                  isDefaultThumbnail ? "bg-zinc-200" : "bg-zinc-900/5 dark:bg-zinc-950"
                }`}
              >
                {activity.icon?.trim() && isDefaultThumbnail ? (
                  <div
                    className="flex h-full min-h-[7rem] w-full items-center justify-center bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/40 dark:to-purple-800/40 md:from-zinc-100 md:to-zinc-200 dark:md:from-zinc-800 dark:md:to-zinc-900"
                    aria-hidden
                  >
                    <span className="text-4xl sm:text-5xl">{activity.icon}</span>
                  </div>
                ) : (
                  <>
                    <img
                      src={thumbnailUrl}
                      alt=""
                      className={`h-full w-full object-center ${
                        isDefaultThumbnail ? "object-contain p-4" : "object-contain"
                      }`}
                    />
                    {activity.youtube_url && !isDefaultThumbnail ? (
                      <div
                        className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/15"
                        aria-hidden
                      >
                        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-red-600/90 text-white shadow sm:h-11 sm:w-11">
                          <svg className="ml-0.5 h-5 w-5 sm:h-5 sm:w-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </span>
                      </div>
                    ) : null}
                  </>
                )}
              </div>
            </button>
            <div className="flex min-h-10 shrink-0 items-center gap-1 border-t border-zinc-200/80 px-1.5 py-1 dark:border-zinc-700/60 sm:gap-1.5 sm:px-2">
              <button
                type="button"
                onClick={() => setOpenActivity(activity)}
                className="min-h-0 min-w-0 flex-1 rounded px-0.5 py-0.5 text-left text-[10px] font-semibold leading-tight text-zinc-900 line-clamp-1 hover:bg-zinc-100/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-purple-500 dark:text-zinc-100 dark:hover:bg-zinc-800/80 sm:text-[11px]"
              >
                {activity.name}
              </button>
              <button
                type="button"
                onClick={() => {
                  startTransition(async () => {
                    await toggleActivityUpvote(activity.id);
                  });
                }}
                disabled={isPending}
                className={`inline-flex max-h-7 shrink-0 items-center gap-0.5 rounded-md border px-1.5 py-0.5 text-[10px] font-medium leading-none transition-colors disabled:opacity-50 sm:gap-1 sm:px-2 sm:text-[11px] ${
                  activity.has_upvoted
                    ? "border-blue-500 bg-blue-500/20 text-blue-700 dark:border-blue-400 dark:bg-blue-400/20 dark:text-blue-300 md:border-zinc-600 md:bg-zinc-200 md:text-zinc-800 dark:md:border-zinc-500 dark:md:bg-zinc-700 dark:md:text-zinc-200"
                    : "border-zinc-300 bg-white text-zinc-600 hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
                }`}
                aria-pressed={activity.has_upvoted}
                aria-label={activity.has_upvoted ? "Remove upvote" : "Upvote"}
              >
                <svg className="h-3 w-3 shrink-0 sm:h-3.5 sm:w-3.5" fill={activity.has_upvoted ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                </svg>
                <span className="tabular-nums">{activity.upvote_count ?? 0}</span>
              </button>
              {activity.youtube_url ? (
                <a
                  href={activity.youtube_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="line-clamp-1 max-h-7 shrink-0 truncate rounded px-0.5 py-0.5 text-[10px] font-medium text-purple-600 underline dark:text-purple-400 sm:px-1 sm:text-[11px] md:text-zinc-600 dark:md:text-zinc-400"
                >
                  Watch
                </a>
              ) : null}
            </div>
            <div className="shrink-0 border-t border-zinc-200/80 px-2 py-1 dark:border-zinc-700/60">
              <p className="line-clamp-1 min-h-[1.125rem] truncate text-center text-[10px] font-normal leading-snug text-zinc-500 dark:text-zinc-400 sm:min-h-[1.25rem] sm:text-[11px]">
                {activity.description?.trim() ? activity.description : "\u00a0"}
              </p>
            </div>
          </article>
          );
        })}
      </div>

      {openActivity && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="presentation"
          onClick={() => setOpenActivity(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="activity-detail-title"
            className={`max-h-[90vh] w-full overflow-y-auto rounded-xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-700 dark:bg-zinc-900 ${
              openYoutubeId ? "max-w-lg" : "max-w-md"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-2">
              <h2
                id="activity-detail-title"
                className="text-lg font-semibold text-zinc-900 dark:text-zinc-100"
              >
                {openActivity.name}
              </h2>
              <button
                type="button"
                onClick={() => setOpenActivity(null)}
                className="shrink-0 rounded p-1 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
                aria-label="Close"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {openYoutubeId ? (
              <YoutubeActivityEmbed
                videoId={openYoutubeId}
                title={openActivity.name}
                youtubeUrl={openActivity.youtube_url}
                className="mt-3"
              />
            ) : (
              <ActivityPopupImage
                urls={getActivityPopupImageCandidates(openActivity)}
                alt=""
              />
            )}
            {openActivity.description ? (
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{openActivity.description}</p>
            ) : null}
            {openActivity.activity_type ? (
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-500">
                Type: {openActivity.activity_type}
              </p>
            ) : null}
            {openActivity.youtube_url ? (
              <div className="mt-3">
                <a
                  href={openActivity.youtube_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-purple-600 underline hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300"
                >
                  Open on YouTube
                </a>
              </div>
            ) : null}

            <AddActivityToScheduleForm
              key={openActivity.id}
              activity={openActivity}
              roster={roster}
              currentUserId={currentUserId}
            />

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setOpenActivity(null)}
                className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
