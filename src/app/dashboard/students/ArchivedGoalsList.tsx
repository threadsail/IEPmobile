"use client";

import { useActionState } from "react";
import IepGoalDisclosureRow from "./IepGoalDisclosureRow";
import { unarchiveStudentGoal } from "./actions";
import type { StudentGoalActionReturnTo } from "./student-goal-action-return-to";

type Props = {
  studentId: string;
  archivedGoals: string[];
  returnToAfterGoalAction?: StudentGoalActionReturnTo;
};

export default function ArchivedGoalsList({
  studentId,
  archivedGoals,
  returnToAfterGoalAction,
}: Props) {
  const [state, formAction] = useActionState(unarchiveStudentGoal, { error: null });

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
      {archivedGoals.map((goal, index) => (
        <IepGoalDisclosureRow
          key={index}
          raw={goal}
          index={index}
          archived
          action={
            <form action={formAction} className="inline">
              <input type="hidden" name="id" value={studentId} />
              <input type="hidden" name="unarchive_index" value={index} />
              {returnToAfterGoalAction ? (
                <input type="hidden" name="return_to" value={returnToAfterGoalAction} />
              ) : null}
              <button
                type="submit"
                className="inline-flex items-center rounded-full border border-pink-300 bg-pink-50 px-2 py-0.5 text-[11px] font-medium text-pink-700 shadow-sm hover:bg-pink-100 dark:border-pink-700 dark:bg-pink-900/30 dark:text-pink-300 dark:hover:bg-pink-900/50"
              >
                Unarchive
              </button>
            </form>
          }
        />
      ))}
    </div>
  );
}
