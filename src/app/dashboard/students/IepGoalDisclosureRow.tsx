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

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 16 16"
      aria-hidden
      className={`h-3.5 w-3.5 shrink-0 text-zinc-400 transition-transform duration-200 dark:text-zinc-500 ${
        open ? "rotate-90" : ""
      }`}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 4l4 4-4 4" />
    </svg>
  );
}

export default function IepGoalDisclosureRow({
  raw,
  index,
  archived = false,
  action,
}: IepGoalDisclosureRowProps) {
  const [open, setOpen] = useState(false);
  const { goal, objectives } = parseStoredGoal(raw);
  const displayTitle = storedGoalTitle(raw, index);
  const goalText = goal.trim();
  const objectiveItems = objectives.map((item) => item.trim()).filter(Boolean);
  const canExpand = goalHasDetails(raw);

  const titleClass = archived
    ? "text-zinc-500 dark:text-zinc-400"
    : "text-zinc-800 dark:text-zinc-100";

  return (
    <div className="min-w-0">
      <div className="flex min-w-0 items-center gap-2">
        {canExpand ? (
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="flex min-w-0 flex-1 items-center gap-2 rounded-md py-2 pr-1 text-left transition-colors hover:bg-zinc-100/80 dark:hover:bg-zinc-800/50"
            aria-expanded={open}
          >
            <Chevron open={open} />
            <span className={`min-w-0 flex-1 truncate text-sm font-medium ${titleClass}`}>
              {displayTitle}
            </span>
          </button>
        ) : (
          <div className="flex min-w-0 flex-1 items-center gap-2 py-2 pr-1">
            <span className="h-3.5 w-3.5 shrink-0" aria-hidden />
            <span className={`min-w-0 flex-1 truncate text-sm font-medium ${titleClass}`}>
              {displayTitle}
            </span>
          </div>
        )}
        {action ? <div className="shrink-0 self-center">{action}</div> : null}
      </div>

      {canExpand && open ? (
        <div className="mb-2 ml-5 space-y-2.5 border-l border-zinc-200/90 pl-3 dark:border-zinc-700/80">
          {goalText ? (
            <div>
              <p className="text-[11px] font-medium text-zinc-400 dark:text-zinc-500">Goal</p>
              <p className="mt-0.5 whitespace-pre-wrap break-words text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                {goalText}
              </p>
            </div>
          ) : null}
          {objectiveItems.length > 0 ? (
            <div>
              <p className="text-[11px] font-medium text-zinc-400 dark:text-zinc-500">Objectives</p>
              <ul className="mt-1 space-y-1.5">
                {objectiveItems.map((item, i) => (
                  <li
                    key={i}
                    className="flex gap-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400"
                  >
                    <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-zinc-300 dark:bg-zinc-600" />
                    <span className="min-w-0 flex-1 whitespace-pre-wrap break-words">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
