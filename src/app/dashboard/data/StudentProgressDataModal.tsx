"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useRef, useState } from "react";
import { submitStudentProgress } from "@/app/dashboard/data/actions";
import StudentProgressHistoryPanel from "@/app/dashboard/data/StudentProgressHistoryPanel";
import { NO_AUTOFILL } from "@/constants/form-autocomplete";
import { studentDisplayName, type Student } from "@/types/student";
import { storedGoalListLabel, storedGoalObjectives, storedObjectiveLabel } from "@/utils/iep-goal-serde";

const inputClass =
  "w-full min-w-0 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500";
const textareaClass =
  "w-full min-w-0 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-500 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500";
const selectClass =
  "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500";

type Props = {
  student: Student | null;
  onClose: () => void;
};

type ModalView = "log" | "history";

function todayInputValue(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

const tabClass = (active: boolean) =>
  active
    ? "border-orange-600 text-orange-700"
    : "border-transparent text-zinc-600 hover:text-zinc-900";

export default function StudentProgressDataModal({ student, onClose }: Props) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [view, setView] = useState<ModalView>("log");
  const [progressText, setProgressText] = useState("");
  const [goalIndex, setGoalIndex] = useState("");
  const [objectiveIndex, setObjectiveIndex] = useState("");
  const [saveState, saveAction] = useActionState(submitStudentProgress, { error: null });

  useEffect(() => {
    if (saveState?.updated) {
      router.refresh();
      setProgressText("");
      setObjectiveIndex("");
    }
  }, [saveState?.updated, router]);

  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    if (student) {
      if (!el.open) el.showModal();
    } else if (el.open) {
      el.close();
    }
  }, [student]);

  useEffect(() => {
    if (student) {
      setProgressText("");
      setGoalIndex("");
      setObjectiveIndex("");
      setView("log");
    }
  }, [student?.id]);

  const name = student ? studentDisplayName(student) : "";
  const activeGoals = student?.goals ?? [];
  const selectedGoalRaw = goalIndex !== "" ? activeGoals[Number(goalIndex)] : undefined;
  const selectedObjectives = selectedGoalRaw ? storedGoalObjectives(selectedGoalRaw) : [];

  return (
    <dialog
      ref={dialogRef}
      className="fixed left-1/2 top-4 z-50 m-0 hidden max-h-[calc(100vh-2rem)] w-[min(36rem,calc(100vw-2rem))] -translate-x-1/2 overflow-hidden rounded-xl border border-zinc-200 bg-white p-0 shadow-2xl backdrop:bg-black/40 open:flex open:flex-col md:left-[calc((100vw+13rem)/2)] md:w-[min(36rem,calc(100vw-13rem-2rem))]"
      onClose={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          dialogRef.current?.close();
        }
      }}
    >
      {student ? (
        <>
          <header className="flex shrink-0 flex-col gap-2 border-b border-zinc-200 px-4 py-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                  {view === "log" ? "Log progress" : "Previous data"}
                </p>
                <h2 className="truncate text-lg font-semibold text-zinc-900">{name}</h2>
              </div>
              <button
                type="button"
                onClick={() => dialogRef.current?.close()}
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-zinc-200 bg-white text-lg leading-none text-zinc-600 hover:bg-zinc-50"
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <div className="flex gap-1 border-b border-zinc-200" role="tablist">
              <button
                type="button"
                role="tab"
                aria-selected={view === "log"}
                onClick={() => setView("log")}
                className={`border-b-2 px-3 py-1.5 text-sm font-medium transition-colors ${tabClass(view === "log")}`}
              >
                Log new
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={view === "history"}
                onClick={() => setView("history")}
                className={`border-b-2 px-3 py-1.5 text-sm font-medium transition-colors ${tabClass(view === "history")}`}
              >
                Previous data
              </button>
            </div>
          </header>

          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
            {view === "log" ? (
              <>
                <p className="text-sm text-zinc-600">
                  Record a dated observation or data point. Tie it to a goal and objective when relevant.
                </p>

                <form key={student.id} action={saveAction} autoComplete={NO_AUTOFILL} className="mt-4 space-y-4">
                  <input type="hidden" name="student_id" value={student.id} />
                  <input type="hidden" name="stay_open" value="1" />

                  <div>
                    <label
                      htmlFor={`progress-date-${student.id}`}
                      className="mb-1 block text-xs font-medium text-zinc-600"
                    >
                      Date
                    </label>
                    <input
                      id={`progress-date-${student.id}`}
                      name="logged_on"
                      type="date"
                      defaultValue={todayInputValue()}
                      className={inputClass}
                      autoComplete={NO_AUTOFILL}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor={`progress-goal-${student.id}`}
                      className="mb-1 block text-xs font-medium text-zinc-600"
                    >
                      Related goal (optional)
                    </label>
                    <select
                      id={`progress-goal-${student.id}`}
                      name="goal_index"
                      className={selectClass}
                      autoComplete={NO_AUTOFILL}
                      value={goalIndex}
                      onChange={(e) => {
                        setGoalIndex(e.target.value);
                        setObjectiveIndex("");
                      }}
                    >
                      <option value="">General / not tied to a single goal</option>
                      {activeGoals.map((raw, i) => (
                        <option key={i} value={String(i)}>
                          {storedGoalListLabel(raw, i)}
                        </option>
                      ))}
                    </select>
                  </div>

                  {selectedObjectives.length > 0 ? (
                    <div>
                      <label
                        htmlFor={`progress-objective-${student.id}`}
                        className="mb-1 block text-xs font-medium text-zinc-600"
                      >
                        Objective / benchmark (optional)
                      </label>
                      <select
                        id={`progress-objective-${student.id}`}
                        name="objective_index"
                        className={selectClass}
                        autoComplete={NO_AUTOFILL}
                        value={objectiveIndex}
                        onChange={(e) => setObjectiveIndex(e.target.value)}
                      >
                        <option value="">All benchmarks / general</option>
                        {selectedObjectives.map((text, i) => (
                          <option key={i} value={String(i)}>
                            {storedObjectiveLabel(selectedGoalRaw!, i)}
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : goalIndex !== "" ? (
                    <p className="text-xs text-zinc-500">
                      No benchmarks on this goal yet. Add them on the student&apos;s IEP tab.
                    </p>
                  ) : null}

                  <div>
                    <label
                      htmlFor={`progress-text-${student.id}`}
                      className="mb-1 block text-xs font-medium text-zinc-600"
                    >
                      Progress or observation
                    </label>
                    <textarea
                      id={`progress-text-${student.id}`}
                      name="progress_text"
                      required
                      rows={6}
                      maxLength={4000}
                      value={progressText}
                      onChange={(e) => setProgressText(e.target.value)}
                      className={`${textareaClass} min-h-[8rem] resize-y`}
                      autoComplete={NO_AUTOFILL}
                      placeholder="e.g. Met benchmark on reading fluency; 45 wpm with 90% accuracy."
                    />
                  </div>

                  {saveState?.error ? (
                    <div
                      role="alert"
                      className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
                    >
                      {saveState.error}
                    </div>
                  ) : null}
                  {saveState?.updated ? (
                    <p className="text-sm font-medium text-emerald-700">Logged.</p>
                  ) : null}

                  <button
                    type="submit"
                    className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-700"
                  >
                    Save progress entry
                  </button>
                </form>
              </>
            ) : (
              <StudentProgressHistoryPanel student={student} refreshKey={saveState?.updated} />
            )}
          </div>

          <footer className="flex shrink-0 flex-wrap items-center gap-2 border-t border-zinc-200 bg-zinc-50/80 px-4 py-3">
            {view === "history" ? (
              <button
                type="button"
                onClick={() => setView("log")}
                className="text-sm font-medium text-orange-600 hover:underline"
              >
                ← Log new entry
              </button>
            ) : (
              <Link
                href={`/dashboard/students?student=${encodeURIComponent(student.id)}`}
                className="text-sm font-medium text-orange-600 hover:underline"
              >
                Edit IEP goals
              </Link>
            )}
            <button
              type="button"
              onClick={() => dialogRef.current?.close()}
              className="ml-auto text-sm font-medium text-zinc-600 hover:text-zinc-900"
            >
              Close
            </button>
          </footer>
        </>
      ) : null}
    </dialog>
  );
}
