"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import {
  archiveStudentGoal,
  unarchiveStudentGoal,
  updateStudent,
} from "@/app/dashboard/students/actions";
import { NO_AUTOFILL } from "@/constants/form-autocomplete";
import type { Student } from "@/types/student";
import {
  emptyParsedGoal,
  goalsContentEqual,
  parseStoredGoal,
  parsedGoalHasContent,
  serializeParsedGoal,
  storedGoalTitle,
  type ParsedGoal,
} from "@/utils/iep-goal-serde";
import IepGoalDisclosureRow from "./IepGoalDisclosureRow";

const inputClass =
  "w-full min-w-0 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-500 focus:border-pink-500 focus:outline-none focus:ring-1 focus:ring-pink-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-400 dark:focus:border-pink-400 dark:focus:ring-pink-400";
const textareaClass =
  "w-full min-w-0 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-500 focus:border-pink-500 focus:outline-none focus:ring-1 focus:ring-pink-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-400 dark:focus:border-pink-400 dark:focus:ring-pink-400";

type Props = {
  student: Student;
  embedded?: boolean;
};

function editorObjectives(goal: ParsedGoal): string[] {
  return goal.objectives.length > 0 ? goal.objectives : [""];
}

function activeGoalsDirty(student: Student, draft: ParsedGoal[]): boolean {
  const server = (student.goals ?? []).map(parseStoredGoal);
  const draftSaved = draft.filter(parsedGoalHasContent);
  if (server.length !== draftSaved.length) return true;
  return draftSaved.some((row, i) => !goalsContentEqual(server[i] ?? emptyParsedGoal(), row));
}

function nonEmptyGoals(goals: ParsedGoal[]): ParsedGoal[] {
  return goals.filter(parsedGoalHasContent);
}

function goalIsDirty(student: Student, index: number, draft: ParsedGoal): boolean {
  const server = (student.goals ?? []).map(parseStoredGoal);
  if (index >= server.length) return parsedGoalHasContent(draft);
  return !goalsContentEqual(server[index], draft);
}

export default function StudentIepGoalsPanel({ student, embedded = false }: Props) {
  const router = useRouter();
  const newGoalTitleRef = useRef<HTMLInputElement | null>(null);
  const [draftActiveGoals, setDraftActiveGoals] = useState<ParsedGoal[]>([]);
  const [editingGoals, setEditingGoals] = useState<Set<number>>(() => new Set());
  const [showArchived, setShowArchived] = useState(false);
  const [saveState, saveAction, isSavePending] = useActionState(updateStudent, { error: null });
  const [archiveState, archiveAction] = useActionState(archiveStudentGoal, {
    error: null,
  });
  const [unarchiveState, unarchiveAction] = useActionState(unarchiveStudentGoal, {
    error: null,
  });

  const archivedRows = useMemo(
    () => (student.archived_goals ?? []).map(parseStoredGoal),
    [student.archived_goals]
  );

  const dirtyActive = activeGoalsDirty(student, draftActiveGoals);
  const serverGoalCount = (student.goals ?? []).length;
  const goalsToSave = nonEmptyGoals(draftActiveGoals);

  useEffect(() => {
    if (saveState?.updated) {
      setEditingGoals(new Set());
      router.refresh();
    }
  }, [saveState?.updated, router]);

  useEffect(() => {
    if (archiveState?.updated || unarchiveState?.updated) {
      router.refresh();
    }
  }, [archiveState?.updated, unarchiveState?.updated, router]);

  useEffect(() => {
    const rows = (student.goals ?? []).map(parseStoredGoal);
    setDraftActiveGoals(rows.length > 0 ? rows : [emptyParsedGoal()]);
    setEditingGoals(new Set());
  }, [student]);

  function addGoal() {
    setDraftActiveGoals((prev) => {
      const nextIndex = prev.length;
      setEditingGoals((editing) => new Set(editing).add(nextIndex));
      return [...prev, emptyParsedGoal()];
    });
    requestAnimationFrame(() => newGoalTitleRef.current?.focus());
  }

  function startEditing(index: number) {
    setEditingGoals((prev) => new Set(prev).add(index));
  }

  function patchGoal(index: number, partial: Partial<ParsedGoal>) {
    setDraftActiveGoals((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], ...partial };
      return next;
    });
    setEditingGoals((prev) => new Set(prev).add(index));
  }

  function patchObjective(goalIndex: number, objectiveIndex: number, value: string) {
    setDraftActiveGoals((prev) => {
      const next = [...prev];
      const objectives = [...editorObjectives(next[goalIndex])];
      objectives[objectiveIndex] = value;
      next[goalIndex] = { ...next[goalIndex], objectives };
      return next;
    });
    setEditingGoals((prev) => new Set(prev).add(goalIndex));
  }

  function addObjective(goalIndex: number) {
    setDraftActiveGoals((prev) => {
      const next = [...prev];
      const objectives = [...editorObjectives(next[goalIndex]), ""];
      next[goalIndex] = { ...next[goalIndex], objectives };
      return next;
    });
    setEditingGoals((prev) => new Set(prev).add(goalIndex));
  }

  function removeObjective(goalIndex: number, objectiveIndex: number) {
    setDraftActiveGoals((prev) => {
      const next = [...prev];
      const objectives = editorObjectives(next[goalIndex]).filter((_, i) => i !== objectiveIndex);
      next[goalIndex] = { ...next[goalIndex], objectives: objectives.length > 0 ? objectives : [""] };
      return next;
    });
    setEditingGoals((prev) => new Set(prev).add(goalIndex));
  }

  function removeGoal(index: number) {
    setDraftActiveGoals((prev) => {
      const next = prev.filter((_, i) => i !== index);
      if (next.length === 0 && (student.goals ?? []).length === 0) {
        return [emptyParsedGoal()];
      }
      return next;
    });
    setEditingGoals((prev) => {
      const next = new Set<number>();
      prev.forEach((i) => {
        if (i < index) next.add(i);
        else if (i > index) next.add(i - 1);
      });
      return next;
    });
  }

  const newestDraftIndex = draftActiveGoals.length - 1;
  const newestIsEmpty =
    newestDraftIndex >= 0 && !parsedGoalHasContent(draftActiveGoals[newestDraftIndex]);

  function renderGoalEditor(goal: ParsedGoal, i: number, focusTitle: boolean) {
    const hasContent = parsedGoalHasContent(goal);
    const canArchive = hasContent && i < serverGoalCount;
    const objectives = editorObjectives(goal);

    return (
      <div className="space-y-3 rounded-lg border border-zinc-200/80 bg-zinc-50/60 p-3 dark:border-zinc-700/50 dark:bg-zinc-800/40">
        <div className="space-y-2">
          <div>
            <label
              htmlFor={`goal-title-${student.id}-${i}`}
              className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400"
            >
              Title
            </label>
            <input
              ref={focusTitle ? newGoalTitleRef : undefined}
              id={`goal-title-${student.id}-${i}`}
              type="text"
              maxLength={200}
              value={goal.title}
              onChange={(e) => patchGoal(i, { title: e.target.value })}
              className={inputClass}
              placeholder="e.g. Reading comprehension"
              autoComplete={NO_AUTOFILL}
            />
          </div>
          <div>
            <label
              htmlFor={`goal-text-${student.id}-${i}`}
              className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400"
            >
              Goal
            </label>
            <textarea
              id={`goal-text-${student.id}-${i}`}
              maxLength={2000}
              rows={3}
              value={goal.goal}
              onChange={(e) => patchGoal(i, { goal: e.target.value })}
              className={`${textareaClass} min-h-[4.5rem] resize-y`}
              autoComplete={NO_AUTOFILL}
              placeholder="Overall goal statement"
            />
          </div>
          <div>
            <div className="mb-1 flex items-center justify-between gap-2">
              <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Objectives</span>
              <button
                type="button"
                onClick={() => addObjective(i)}
                className="text-xs font-medium text-pink-700 hover:underline dark:text-pink-300"
              >
                + Add objective
              </button>
            </div>
            <div className="space-y-2">
              {objectives.map((objective, j) => (
                <div key={j} className="flex gap-2">
                  <input
                    type="text"
                    maxLength={500}
                    value={objective}
                    onChange={(e) => patchObjective(i, j, e.target.value)}
                    className={inputClass}
                    placeholder={`Objective ${j + 1}`}
                    autoComplete={NO_AUTOFILL}
                  />
                  {objectives.length > 1 ? (
                    <button
                      type="button"
                      onClick={() => removeObjective(i, j)}
                      className="shrink-0 px-2 text-xs font-medium text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
                      aria-label={`Remove objective ${j + 1}`}
                    >
                      Remove
                    </button>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {!hasContent ? (
            <button
              type="button"
              onClick={() => removeGoal(i)}
              className="text-xs font-medium text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
            >
              Remove
            </button>
          ) : canArchive ? (
            <form action={archiveAction} className="inline">
              <input type="hidden" name="id" value={student.id} />
              <input type="hidden" name="archive_index" value={i} />
              <input type="hidden" name="stay_open" value="1" />
              <button
                type="submit"
                disabled={dirtyActive}
                className="text-xs font-medium text-zinc-500 hover:text-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 dark:text-zinc-400 dark:hover:text-zinc-200"
              >
                Archive
              </button>
            </form>
          ) : null}
        </div>
      </div>
    );
  }

  const panel = (
    <div className="space-y-4">
      <div className="space-y-2">
        {draftActiveGoals.map((goal, i) => {
          const isSaved = i < serverGoalCount && parsedGoalHasContent(goal);
          const isDirty = goalIsDirty(student, i, goal);
          const isEditing = editingGoals.has(i) || i >= serverGoalCount || isDirty || (newestIsEmpty && i === newestDraftIndex);

          if (isSaved && !isEditing) {
            const raw = serializeParsedGoal(goal);
            return (
              <div
                key={i}
                className="rounded-lg border border-zinc-200/70 bg-white/50 px-2 dark:border-zinc-700/50 dark:bg-zinc-900/20"
              >
                <IepGoalDisclosureRow
                  raw={raw}
                  index={i}
                  action={
                    <button
                      type="button"
                      onClick={() => startEditing(i)}
                      className="rounded-md px-2 py-1 text-xs font-medium text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
                    >
                      Edit
                    </button>
                  }
                />
              </div>
            );
          }

          return (
            <div key={i}>
              {renderGoalEditor(goal, i, newestIsEmpty && i === newestDraftIndex)}
            </div>
          );
        })}
      </div>

      <button
        type="button"
        onClick={addGoal}
        className="w-full rounded-lg border border-dashed border-pink-400/70 bg-pink-500/5 px-3 py-2.5 text-sm font-medium text-pink-800 transition-colors hover:bg-pink-500/10 dark:border-pink-500/50 dark:bg-pink-400/5 dark:text-pink-200 dark:hover:bg-pink-400/10"
      >
        + Add goal
      </button>

      {archivedRows.length > 0 ? (
        <div className="border-t border-zinc-200/80 pt-3 dark:border-zinc-700/50">
          <button
            type="button"
            onClick={() => setShowArchived((v) => !v)}
            className="text-xs font-medium text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
          >
            {showArchived ? "Hide" : "Show"} archived ({archivedRows.length})
          </button>
          {showArchived ? (
            <ul className="mt-2 divide-y divide-zinc-200/70 overflow-hidden rounded-lg border border-zinc-200/70 dark:divide-zinc-700/50 dark:border-zinc-700/50">
              {archivedRows.map((row, i) => (
                <li key={i} className="bg-white/40 px-2 dark:bg-zinc-900/20">
                  <IepGoalDisclosureRow
                    raw={serializeParsedGoal(row)}
                    index={i}
                    archived
                    action={
                      <form action={unarchiveAction} className="inline">
                        <input type="hidden" name="id" value={student.id} />
                        <input type="hidden" name="unarchive_index" value={i} />
                        <input type="hidden" name="stay_open" value="1" />
                        <button
                          type="submit"
                          disabled={dirtyActive}
                          className="rounded-md px-2 py-1 text-xs font-medium text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
                        >
                          Restore
                        </button>
                      </form>
                    }
                  />
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}

      {dirtyActive ? (
        <p className="text-xs text-amber-800 dark:text-amber-200/90">
          Save changes before archiving or restoring.
        </p>
      ) : null}

      {(archiveState?.error ?? unarchiveState?.error) ? (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-800 dark:bg-red-950/40 dark:text-red-200"
        >
          {archiveState?.error ?? unarchiveState?.error}
        </div>
      ) : null}

      <form key={student.id} action={saveAction} autoComplete={NO_AUTOFILL} className="space-y-2">
        <input type="hidden" name="id" value={student.id} />
        <input type="hidden" name="update_goals" value="1" />
        <input type="hidden" name="first_name" value={student.first_name ?? ""} />
        <input type="hidden" name="last_name" value={student.last_name ?? ""} />
        <input type="hidden" name="note" value={student.note ?? ""} />
        <input type="hidden" name="grade" value={student.grade ?? ""} />
        <input type="hidden" name="classroom" value={student.classroom ?? ""} />
        <input type="hidden" name="stay_open" value="1" />

        {goalsToSave.map((row, i) => (
          <input key={i} type="hidden" name="goals" value={serializeParsedGoal(row)} />
        ))}

        {saveState?.error ? (
          <div
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-800 dark:bg-red-950/40 dark:text-red-200"
          >
            {saveState.error}
          </div>
        ) : null}
        {saveState?.updated ? (
          <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">Saved.</p>
        ) : null}

        <button
          type="submit"
          disabled={isSavePending || !dirtyActive}
          className="rounded-lg bg-pink-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-pink-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-pink-500 dark:hover:bg-pink-600"
        >
          {isSavePending ? "Saving…" : "Save goals"}
        </button>
      </form>
    </div>
  );

  if (embedded) {
    return panel;
  }

  return (
    <section className="rounded-lg border border-zinc-200/80 bg-zinc-50/50 p-4 dark:border-zinc-700/50 dark:bg-zinc-800/40">
      <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">IEP goals</h3>
      <div className="mt-3">{panel}</div>
    </section>
  );
}
