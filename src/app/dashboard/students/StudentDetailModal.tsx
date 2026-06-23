"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { studentDisplayName, type Student } from "@/types/student";
import StudentDetailTabs from "./StudentDetailTabs";

type Props = {
  student: Student | null;
  onClose: () => void;
};

export default function StudentDetailModal({ student, onClose }: Props) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (student) {
      if (!el.open) el.showModal();
    } else if (el.open) {
      el.close();
    }
  }, [student]);

  return (
    <dialog
      ref={ref}
      className="fixed left-1/2 top-1/2 z-50 hidden max-h-[min(90vh,52rem)] w-[min(42rem,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-xl border border-zinc-200 bg-white p-0 shadow-2xl backdrop:bg-black/40 open:flex open:flex-col dark:border-zinc-700 dark:bg-zinc-900 md:left-[calc((100vw+13rem)/2)] md:w-[min(42rem,calc(100vw-13rem-2rem))]"
      onClose={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          ref.current?.close();
        }
      }}
    >
      {student ? (
        <>
          <header className="flex shrink-0 items-start justify-between gap-3 border-b border-zinc-200 px-4 py-3 dark:border-zinc-700">
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                Student details
              </p>
              <h2 className="truncate text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                {studentDisplayName(student)}
              </h2>
            </div>
            <button
              type="button"
              onClick={() => ref.current?.close()}
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-zinc-200 bg-white text-lg leading-none text-zinc-600 hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
              aria-label="Close"
            >
              ×
            </button>
          </header>

          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
            <StudentDetailTabs student={student} variant="modal" />
          </div>

          <footer className="flex shrink-0 flex-wrap items-center gap-2 border-t border-zinc-200 bg-zinc-50/80 px-4 py-3 dark:border-zinc-700 dark:bg-zinc-900/80">
            <Link
              href={`/dashboard/students/${student.id}/edit`}
              className="rounded-lg bg-pink-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-pink-700 dark:bg-pink-500 dark:hover:bg-pink-600"
            >
              Edit student
            </Link>
            <button
              type="button"
              onClick={() => ref.current?.close()}
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
