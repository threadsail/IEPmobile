"use client";

import { NO_AUTOFILL } from "@/constants/form-autocomplete";
import type { ParsedGoal } from "@/utils/iep-goal-serde";

const inputClass =
  "w-full min-w-0 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-500 focus:border-pink-500 focus:outline-none focus:ring-1 focus:ring-pink-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-400 dark:focus:border-pink-400 dark:focus:ring-pink-400";
const textareaClass =
  "w-full min-w-0 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-500 focus:border-pink-500 focus:outline-none focus:ring-1 focus:ring-pink-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-400 dark:focus:border-pink-400 dark:focus:ring-pink-400";

type IepGoalFieldsEditorProps = {
  goals: ParsedGoal[];
  onChange: (goals: ParsedGoal[]) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
};

export default function IepGoalFieldsEditor({
  goals,
  onChange,
  onAdd,
  onRemove,
}: IepGoalFieldsEditorProps) {
  function patchGoal(index: number, partial: Partial<ParsedGoal>) {
    onChange(goals.map((g, i) => (i === index ? { ...g, ...partial } : g)));
  }

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">IEP goals</span>
        <button
          type="button"
          onClick={onAdd}
          className="rounded-lg border border-pink-500 bg-pink-500/10 px-3 py-1.5 text-sm font-medium text-pink-700 transition-colors hover:bg-pink-500/20 dark:border-pink-400 dark:bg-pink-400/10 dark:text-pink-300 dark:hover:bg-pink-400/20"
        >
          + Add goal
        </button>
      </div>
      <div className="space-y-4">
        {goals.map((goal, i) => (
          <div
            key={i}
            className="rounded-lg border border-zinc-200/80 bg-zinc-50/50 p-3 dark:border-zinc-700/50 dark:bg-zinc-800/30"
          >
            <div className="mb-2 flex items-center justify-between gap-2">
              <span className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                Goal {i + 1}
              </span>
              {i > 0 ? (
                <button
                  type="button"
                  onClick={() => onRemove(i)}
                  className="text-xs font-medium text-zinc-500 hover:text-red-600 dark:text-zinc-400 dark:hover:text-red-400"
                >
                  Remove
                </button>
              ) : null}
            </div>
            <div className="space-y-2">
              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
                  Title
                </label>
                <input
                  type="text"
                  maxLength={200}
                  placeholder="Short goal title"
                  value={goal.title}
                  onChange={(e) => patchGoal(i, { title: e.target.value })}
                  className={inputClass}
                  autoComplete={NO_AUTOFILL}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
                  Goal
                </label>
                <textarea
                  rows={3}
                  maxLength={2000}
                  placeholder="Measurable details, criteria, or notes for this goal"
                  value={goal.description}
                  onChange={(e) => patchGoal(i, { description: e.target.value })}
                  className={`${textareaClass} min-h-[4.5rem] resize-y`}
                  autoComplete={NO_AUTOFILL}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export { inputClass as iepGoalInputClass };
