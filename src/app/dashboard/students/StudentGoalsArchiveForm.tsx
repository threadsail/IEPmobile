"use client";

import { useActionState } from "react";
import { storedGoalListLabel } from "@/utils/iep-goal-serde";
import { archiveStudentGoal } from "./actions";
import type { StudentGoalActionReturnTo } from "./student-goal-action-return-to";

type Props = {
  studentId: string;
  goals: string[];
  returnToAfterGoalAction?: StudentGoalActionReturnTo;
};

export default function StudentGoalsArchiveForm({
  studentId,
  goals,
  returnToAfterGoalAction,
}: Props) {
  const [state, formAction] = useActionState(archiveStudentGoal, { error: null });

  return (
    <div className="mt-3 space-y-2">
      {state?.error ? (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-800 dark:bg-red-950/40 dark:text-red-200"
        >
          {state.error}
        </div>
      ) : null}
      {goals.map((goal, index) => (
        <form
          key={index}
          action={formAction}
          className="flex items-start gap-3 rounded-md bg-zinc-50 px-3 py-2 dark:bg-zinc-800/60"
        >
          <input type="hidden" name="id" value={studentId} />
          <input type="hidden" name="archive_index" value={index} />
          {returnToAfterGoalAction ? (
            <input type="hidden" name="return_to" value={returnToAfterGoalAction} />
          ) : null}
          <span className="flex-1 text-sm text-zinc-700 dark:text-zinc-300">
            {storedGoalListLabel(goal, index)}
          </span>
          <button
            type="submit"
            className="inline-flex items-center rounded-full border border-zinc-300 bg-white px-2 py-0.5 text-[11px] font-medium text-zinc-500 shadow-sm hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            Archive
          </button>
        </form>
      ))}
    </div>
  );
}
