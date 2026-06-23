"use client";

import { useState } from "react";
import {
  goalHasDetails,
  parseStoredGoal,
  storedGoalTitle,
} from "@/utils/iep-goal-serde";

type IepGoalDisclosureRowProps = {
  raw: string;
  index: number;
  archived?: boolean;
  action?: React.ReactNode;
};

export default function IepGoalDisclosureRow({
  raw,
  index,
  archived = false,
  action,
}: IepGoalDisclosureRowProps) {
  const [open, setOpen] = useState(false);
  const { title, description } = parseStoredGoal(raw);
  const displayTitle = storedGoalTitle(raw, index);
  const details = description.trim();
  const canExpand = goalHasDetails(raw);

  return (
    <div
      className={`rounded-md border px-3 py-2 ${
        archived
          ? "border-zinc-200/80 bg-zinc-50 dark:border-zinc-700/50 dark:bg-zinc-800/60"
          : "border-zinc-200/80 bg-zinc-50 dark:border-zinc-700/50 dark:bg-zinc-800/60"
      }`}
    >
      <div className="flex min-w-0 items-start gap-2">
        {canExpand ? (
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="mt-0.5 flex min-w-0 flex-1 items-start gap-2 text-left"
            aria-expanded={open}
          >
            <span
              className={`mt-1 shrink-0 text-zinc-400 transition-transform dark:text-zinc-500 ${open ? "rotate-90" : ""}`}
              aria-hidden
            >
              ›
            </span>
            <span
              className={`min-w-0 flex-1 break-words text-sm font-medium ${
                archived
                  ? "text-zinc-500 dark:text-zinc-400"
                  : "text-zinc-800 dark:text-zinc-200"
              }`}
            >
              {displayTitle}
            </span>
          </button>
        ) : (
          <span
            className={`min-w-0 flex-1 break-words text-sm font-medium ${
              archived
                ? "text-zinc-500 dark:text-zinc-400"
                : "text-zinc-800 dark:text-zinc-200"
            }`}
          >
            {displayTitle}
          </span>
        )}
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      {canExpand && open ? (
        <div className="mt-2 border-t border-zinc-200/80 pt-2 pl-5 dark:border-zinc-700/50">
          <p className="whitespace-pre-wrap break-words text-sm text-zinc-600 dark:text-zinc-400">
            {details}
          </p>
          {!title.trim() && details ? (
            <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">No separate title set</p>
          ) : null}
        </div>
      ) : null}
      {canExpand && !open ? (
        <p className="mt-1 pl-5 text-xs text-zinc-400 dark:text-zinc-500">Tap to view goal details</p>
      ) : null}
    </div>
  );
}
