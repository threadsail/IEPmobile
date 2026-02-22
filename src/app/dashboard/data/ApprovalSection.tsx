import type { AppliedStudentData } from "@/types/applied-student-data";
import { approveAppliedData, rejectAppliedData } from "./actions";

export default function ApprovalSection({ items }: { items: AppliedStudentData[] }) {
  if (items.length === 0) {
    return (
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        No student data pending approval. When aides apply data, it will appear here.
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li
          key={item.id}
          className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-zinc-200/80 bg-white/70 p-4 shadow-sm dark:border-zinc-700/50 dark:bg-zinc-900/60"
        >
          <div className="min-w-0 flex-1">
            <p className="font-medium text-zinc-900 dark:text-zinc-100">
              {item.student_name || `Student ${item.student_id}`}
            </p>
            <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
              Applied by {item.aide_name || "Aide"} · {formatDate(item.applied_at)}
            </p>
            {item.summary ? (
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">{item.summary}</p>
            ) : null}
          </div>
          <div className="flex shrink-0 gap-2">
            <form action={approveAppliedData}>
              <input type="hidden" name="id" value={item.id} />
              <button
                type="submit"
                className="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600"
              >
                Approve
              </button>
            </form>
            <form action={rejectAppliedData}>
              <input type="hidden" name="id" value={item.id} />
              <button
                type="submit"
                className="rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
              >
                Reject
              </button>
            </form>
          </div>
        </li>
      ))}
    </ul>
  );
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}
