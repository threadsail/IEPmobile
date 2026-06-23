"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useRef, useState } from "react";
import { submitStudentProgress } from "@/app/dashboard/data/actions";
import { NO_AUTOFILL } from "@/constants/form-autocomplete";
import { studentDisplayName, type Student } from "@/types/student";
import { parseStoredGoal, serializeParsedGoal, storedGoalListLabel } from "@/utils/iep-goal-serde";

const inputClass =
  "w-full min-w-0 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-orange-400 dark:focus:ring-orange-400";
const textareaClass =
  "w-full min-w-0 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-500 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-400 dark:focus:border-orange-400 dark:focus:ring-orange-400";
const selectClass =
  "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-orange-400 dark:focus:ring-orange-400";

type Props = {
  student: Student | null;
  onClose: () => void;
};

function todayInputValue(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function StudentProgressDataModal({ student, onClose }: Props) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [progressText, setProgressText] = useState("");
  const [saveState, saveAction] = useActionState(submitStudentProgress, { error: null });

  useEffect(() => {
    if (saveState?.updated) {
      router.refresh();
      setProgressText("");
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
    if (student) setProgressText("");
  }, [student?.id]);

  const name = student ? studentDisplayName(student) : "";
  const activeGoals = student?.goals ?? [];

  return (
    <dialog
      ref={dialogRef}
      className="fixed left-1/2 top-1/2 z-50 hidden max-h-[min(90vh,48rem)] w-[min(36rem,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-xl border border-zinc-200 bg-white p-0 shadow-2xl backdrop:bg-black/40 open:flex open:flex-col dark:border-zinc-700 dark:bg-zinc-900 md:left-[calc((100vw+13rem)/2)] md:w-[min(36rem,calc(100vw-13rem-2rem))]"
      onClose={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          dialogRef.current?.close();
        }
      }}
    >
      {student ? (
        <>
          <header className="flex shrink-0 items-start justify-between gap-3 border-b border-zinc-200 px-4 py-3 dark:border-zinc-700">
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                Log progress
              </p>
              <h2 className="truncate text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                {name}
              </h2>
            </div>
            <button
              type="button"
              onClick={() => dialogRef.current?.close()}
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-zinc-200 bg-white text-lg leading-none text-zinc-600 hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
              aria-label="Close"
            >
              ×
            </button>
          </header>

          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Record a dated observation or data point. Optionally tie it to an active IEP goal.
              Enable storage in Supabase using{" "}
              <span className="font-mono text-xs">supabase-student-progress-log.sql</span>.
            </p>

            <form key={student.id} action={saveAction} autoComplete={NO_AUTOFILL} className="mt-4 space-y-4">
              <input type="hidden" name="student_id" value={student.id} />
              <input type="hidden" name="stay_open" value="1" />

              <div>
                <label
                  htmlFor={`progress-date-${student.id}`}
                  className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400"
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
                  className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400"
                >
                  Related goal (optional)
                </label>
                <select
                  id={`progress-goal-${student.id}`}
                  name="goal_index"
                  className={selectClass}
                  autoComplete={NO_AUTOFILL}
                  defaultValue=""
                >
                  <option value="">General / not tied to a single goal</option>
                  {activeGoals.map((raw, i) => {
                    const row = parseStoredGoal(raw);
                    return (
                      <option key={i} value={String(i)}>
                        {storedGoalListLabel(serializeParsedGoal(row), i)}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label
                  htmlFor={`progress-text-${student.id}`}
                  className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400"
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
                  className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-800 dark:bg-red-950/40 dark:text-red-200"
                >
                  {saveState.error}
                </div>
              ) : null}
              {saveState?.updated ? (
                <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
                  Logged.
                </p>
              ) : null}

              <button
                type="submit"
                className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-700 dark:bg-orange-500 dark:hover:bg-orange-600"
              >
                Save progress entry
              </button>
            </form>
          </div>

          <footer className="flex shrink-0 flex-wrap items-center gap-2 border-t border-zinc-200 bg-zinc-50/80 px-4 py-3 dark:border-zinc-700 dark:bg-zinc-900/80">
            <Link
              href={`/dashboard/students?student=${encodeURIComponent(student.id)}`}
              className="text-sm font-medium text-orange-600 hover:underline dark:text-orange-400"
            >
              Edit IEP goals on Students page
            </Link>
            <button
              type="button"
              onClick={() => dialogRef.current?.close()}
              className="ml-auto text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
            >
              Close
            </button>
          </footer>
        </>
      ) : null}
    </dialog>
  );
}
