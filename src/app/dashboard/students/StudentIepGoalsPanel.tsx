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
  parseStoredGoal,
  serializeGoal,
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
};

const emptyGoal = (): ParsedGoal => ({ title: "", description: "" });

type SelectKind = "active" | "archived";

function parseGoalSelectKey(
  raw: string
): { kind: SelectKind; index: number } | null {
  if (raw.startsWith("a:")) {
    const index = Number(raw.slice(2));
    return Number.isFinite(index) && index >= 0 ? { kind: "active", index } : null;
  }
  if (raw.startsWith("z:")) {
    const index = Number(raw.slice(2));
    return Number.isFinite(index) && index >= 0 ? { kind: "archived", index } : null;
  }
  return null;
}

function formatGoalSelectKey(kind: SelectKind, index: number): string {
  return kind === "active" ? `a:${index}` : `z:${index}`;
}

function defaultSelectKey(activeLen: number, archivedLen: number): string {
  if (activeLen > 0) return "a:0";
  if (archivedLen > 0) return "z:0";
  return "a:0";
}

function clampGoalSelectKey(
  key: string,
  activeLen: number,
  archivedLen: number
): string {
  const p = parseGoalSelectKey(key);
  if (!p) return defaultSelectKey(activeLen, archivedLen);
  if (p.kind === "active") {
    if (activeLen <= 0) {
      return archivedLen > 0 ? "z:0" : "a:0";
    }
    return formatGoalSelectKey("active", Math.min(p.index, activeLen - 1));
  }
  if (archivedLen <= 0) {
    return activeLen > 0 ? "a:0" : "a:0";
  }
  return formatGoalSelectKey("archived", Math.min(p.index, archivedLen - 1));
}

function activeGoalsDirty(student: Student, draft: ParsedGoal[]): boolean {
  const server = student.goals ?? [];
  if (server.length !== draft.length) return true;
  return draft.some((row, i) => {
    const parsed = parseStoredGoal(server[i] ?? "");
    return parsed.title !== row.title || parsed.description !== row.description;
  });
}

export default function StudentIepGoalsPanel({ student }: Props) {
  const router = useRouter();
  const prevStudentIdRef = useRef<string | null>(null);
  const [draftActiveGoals, setDraftActiveGoals] = useState<ParsedGoal[]>([]);
  const [selectedKey, setSelectedKey] = useState("a:0");
  const [saveState, saveAction] = useActionState(updateStudent, { error: null });
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

  useEffect(() => {
    if (saveState?.updated) {
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
    setDraftActiveGoals(rows);
    const zLen = (student.archived_goals ?? []).length;
    if (prevStudentIdRef.current !== student.id) {
      setSelectedKey(defaultSelectKey(rows.length, zLen));
      prevStudentIdRef.current = student.id;
    }
  }, [student]);

  useEffect(() => {
    const zLen = archivedRows.length;
    const aLen = draftActiveGoals.length;
    setSelectedKey((prev) => clampGoalSelectKey(prev, aLen, zLen));
  }, [draftActiveGoals.length, archivedRows.length]);

  const parsed = parseGoalSelectKey(selectedKey);
  const isArchivedSelection = parsed?.kind === "archived";
  const activeIndex = parsed?.kind === "active" ? parsed.index : -1;
  const archivedIndex = parsed?.kind === "archived" ? parsed.index : -1;

  const current =
    isArchivedSelection && archivedIndex >= 0
      ? (archivedRows[archivedIndex] ?? emptyGoal())
      : activeIndex >= 0
        ? (draftActiveGoals[activeIndex] ?? emptyGoal())
        : emptyGoal();

  const selectOptionCount = draftActiveGoals.length + archivedRows.length;
  const hasContent = Boolean(current.title.trim() || current.description.trim());

  function addGoal() {
    setDraftActiveGoals((prev) => {
      const next = [...prev, emptyGoal()];
      setSelectedKey(formatGoalSelectKey("active", next.length - 1));
      return next;
    });
  }

  function removeEmptyActiveGoal() {
    if (activeIndex < 0 || activeIndex >= draftActiveGoals.length) return;
    const row = draftActiveGoals[activeIndex];
    if (serializeGoal(row.title, row.description)) return;
    setDraftActiveGoals((prev) => prev.filter((_, j) => j !== activeIndex));
  }

  function patchSelectedActive(partial: Partial<ParsedGoal>) {
    if (activeIndex < 0 || activeIndex >= draftActiveGoals.length) return;
    setDraftActiveGoals((prev) => {
      const next = [...prev];
      next[activeIndex] = { ...next[activeIndex], ...partial };
      return next;
    });
  }

  return (
    <section className="rounded-lg border border-zinc-200/80 bg-zinc-50/50 p-4 dark:border-zinc-700/50 dark:bg-zinc-800/40">
      <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">IEP goals</h3>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        Add a title and goal details for each IEP objective. Tap a title to expand details; use Edit
        to change a goal. Save before archiving or unarchiving.
      </p>

      <div className="mt-4 rounded-lg border border-zinc-200/80 bg-white/60 p-4 dark:border-zinc-700/40 dark:bg-zinc-900/40">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Goals
          </h4>
          <button
            type="button"
            onClick={addGoal}
            className="shrink-0 rounded-lg border border-pink-500 bg-pink-500/10 px-3 py-1.5 text-xs font-medium text-pink-800 transition-colors hover:bg-pink-500/20 dark:border-pink-400 dark:bg-pink-400/10 dark:text-pink-200 dark:hover:bg-pink-400/20"
          >
            + New goal
          </button>
        </div>

        <div className="mt-3 space-y-2">
          {draftActiveGoals.length === 0 ? (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              No active goals yet.
            </p>
          ) : (
            draftActiveGoals.map((row, i) => {
              const raw = serializeGoal(row.title, row.description);
              const displayRaw = raw || serializeGoal(row.title.trim() || "New goal", row.description);
              const selected = activeIndex === i;
              return (
                <div
                  key={`active-${i}`}
                  className={selected ? "rounded-md ring-2 ring-pink-400/60 ring-offset-1 dark:ring-pink-500/50" : ""}
                >
                  <IepGoalDisclosureRow raw={displayRaw} index={i} />
                  <div className="mt-1 flex justify-end px-1 pb-1">
                    <button
                      type="button"
                      onClick={() => setSelectedKey(formatGoalSelectKey("active", i))}
                      className="text-xs font-medium text-pink-700 hover:underline dark:text-pink-300"
                    >
                      {selected ? "Editing" : "Edit"}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {archivedRows.length > 0 ? (
          <div className="mt-4 border-t border-zinc-200/80 pt-3 dark:border-zinc-700/50">
            <h5 className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Archived
            </h5>
            <div className="mt-2 space-y-2">
              {archivedRows.map((row, i) => (
                <div
                  key={`archived-${i}`}
                  className={
                    archivedIndex === i
                      ? "rounded-md ring-2 ring-zinc-300 ring-offset-1 dark:ring-zinc-600"
                      : ""
                  }
                >
                  <IepGoalDisclosureRow
                    raw={serializeGoal(row.title, row.description)}
                    index={i}
                    archived
                  />
                  <div className="mt-1 flex justify-end px-1 pb-1">
                    <button
                      type="button"
                      onClick={() => setSelectedKey(formatGoalSelectKey("archived", i))}
                      className="text-xs font-medium text-zinc-600 hover:underline dark:text-zinc-400"
                    >
                      {archivedIndex === i ? "Selected" : "Select"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {isArchivedSelection ? (
          <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
            Archived goals are read-only here. Unarchive to edit them again in the active list.
          </p>
        ) : null}
        {dirtyActive ? (
          <p className="mt-2 text-xs font-medium text-amber-800 dark:text-amber-200/90">
            Save goal changes before archiving or unarchiving.
          </p>
        ) : null}

        {(archiveState?.error ?? unarchiveState?.error) ? (
          <div
            role="alert"
            className="mt-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-800 dark:bg-red-950/40 dark:text-red-200"
          >
            {archiveState?.error ?? unarchiveState?.error}
          </div>
        ) : null}

        <div className="mt-4 space-y-3">
          {selectOptionCount === 0 ? (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              No goals yet. Use <span className="font-medium">New goal</span> to add a title and goal
              details.
            </p>
          ) : isArchivedSelection ? (
            <div className="rounded-lg border border-zinc-200/80 bg-zinc-50/80 p-3 dark:border-zinc-700/50 dark:bg-zinc-900/40">
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                Archived goal
              </p>
              <p className="mt-2 text-sm font-medium text-zinc-800 dark:text-zinc-200">
                {storedGoalTitle(serializeGoal(current.title, current.description), archivedIndex)}
              </p>
              {current.description.trim() ? (
                <p className="mt-2 whitespace-pre-wrap break-words text-sm text-zinc-600 dark:text-zinc-400">
                  {current.description.trim()}
                </p>
              ) : null}
            </div>
          ) : activeIndex >= 0 ? (
            <>
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                Edit goal {activeIndex + 1}
              </p>
              <div>
                <label
                  htmlFor={`goal-title-${student.id}`}
                  className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400"
                >
                  Title
                </label>
                <input
                  id={`goal-title-${student.id}`}
                  type="text"
                  maxLength={200}
                  value={current.title}
                  onChange={(e) => patchSelectedActive({ title: e.target.value })}
                  className={inputClass}
                  placeholder="Short goal title"
                  autoComplete={NO_AUTOFILL}
                />
              </div>
              <div>
                <label
                  htmlFor={`goal-desc-${student.id}`}
                  className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400"
                >
                  Goal
                </label>
                <textarea
                  id={`goal-desc-${student.id}`}
                  maxLength={2000}
                  rows={5}
                  value={current.description}
                  onChange={(e) => patchSelectedActive({ description: e.target.value })}
                  className={`${textareaClass} min-h-[7rem] resize-y`}
                  autoComplete={NO_AUTOFILL}
                  placeholder="Measurable details, criteria, or notes for this goal"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {!hasContent ? (
                  <button
                    type="button"
                    onClick={removeEmptyActiveGoal}
                    className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                  >
                    Remove empty goal
                  </button>
                ) : null}

                {hasContent ? (
                  <form action={archiveAction} className="inline">
                    <input type="hidden" name="id" value={student.id} />
                    <input type="hidden" name="archive_index" value={activeIndex} />
                    <input type="hidden" name="stay_open" value="1" />
                    <button
                      type="submit"
                      disabled={dirtyActive || activeIndex < 0}
                      className="rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-800 transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
                    >
                      Archive goal
                    </button>
                  </form>
                ) : null}
              </div>
            </>
          ) : null}

          {isArchivedSelection && archivedIndex >= 0 ? (
            <form action={unarchiveAction} className="inline">
              <input type="hidden" name="id" value={student.id} />
              <input type="hidden" name="unarchive_index" value={archivedIndex} />
              <input type="hidden" name="stay_open" value="1" />
              <button
                type="submit"
                disabled={dirtyActive}
                className="rounded-lg border border-pink-500 bg-pink-500/15 px-3 py-1.5 text-sm font-medium text-pink-900 transition-colors hover:bg-pink-500/25 disabled:cursor-not-allowed disabled:opacity-50 dark:border-pink-400 dark:bg-pink-400/15 dark:text-pink-100 dark:hover:bg-pink-400/25"
              >
                Unarchive goal
              </button>
            </form>
          ) : null}

          <form key={student.id} action={saveAction} autoComplete={NO_AUTOFILL} className="space-y-3 border-t border-zinc-200/80 pt-3 dark:border-zinc-700/50">
            <input type="hidden" name="id" value={student.id} />
            <input type="hidden" name="first_name" value={student.first_name ?? ""} />
            <input type="hidden" name="last_name" value={student.last_name ?? ""} />
            <input type="hidden" name="note" value={student.note ?? ""} />
            <input type="hidden" name="grade" value={student.grade ?? ""} />
            <input type="hidden" name="classroom" value={student.classroom ?? ""} />
            <input type="hidden" name="stay_open" value="1" />

            {draftActiveGoals.map((row, i) => (
              <input
                key={i}
                type="hidden"
                name="goals"
                value={serializeGoal(row.title, row.description)}
              />
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
              className="rounded-lg bg-pink-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-pink-700 dark:bg-pink-500 dark:hover:bg-pink-600"
            >
              Save goals
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
