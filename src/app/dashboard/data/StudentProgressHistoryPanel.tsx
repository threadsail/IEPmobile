"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchStudentProgressLogs } from "@/app/dashboard/data/actions";
import FormattedLocalDateTime from "@/components/FormattedLocalDateTime";
import type { Student } from "@/types/student";
import type { StudentProgressLog } from "@/types/student-progress-log";
import { parseStoredGoal, storedGoalListLabel, storedObjectiveLabel } from "@/utils/iep-goal-serde";

type GoalFilter = "all" | "general" | number;

type Props = {
  student: Student;
  refreshKey?: number;
};

function goalFilterRpcValue(filter: GoalFilter): number | null {
  if (filter === "all") return null;
  if (filter === "general") return -1;
  return filter;
}

function goalLabel(student: Student, goalIndex: number | null): string {
  if (goalIndex == null) return "General";
  const raw = student.goals?.[goalIndex];
  if (!raw) return `Goal ${goalIndex + 1}`;
  return storedGoalListLabel(raw, goalIndex);
}

function objectiveLabel(
  student: Student,
  goalIndex: number | null,
  objectiveIndex: number | null
): string | null {
  if (goalIndex == null || objectiveIndex == null) return null;
  const raw = student.goals?.[goalIndex];
  if (!raw) return `Objective ${objectiveIndex + 1}`;
  return storedObjectiveLabel(raw, objectiveIndex);
}

function formatMonthKey(key: string): string {
  const [year, month] = key.split("-");
  const d = new Date(Number(year), Number(month) - 1, 1);
  return d.toLocaleDateString(undefined, { month: "short", year: "2-digit" });
}

function buildMonthlyCounts(logs: StudentProgressLog[]): { key: string; label: string; count: number }[] {
  const map = new Map<string, number>();
  for (const log of logs) {
    const key = log.logged_on.slice(0, 7);
    if (!/^\d{4}-\d{2}$/.test(key)) continue;
    map.set(key, (map.get(key) ?? 0) + 1);
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6)
    .map(([key, count]) => ({ key, label: formatMonthKey(key), count }));
}

export default function StudentProgressHistoryPanel({ student, refreshKey }: Props) {
  const [filter, setFilter] = useState<GoalFilter>("all");
  const [logs, setLogs] = useState<StudentProgressLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const activeGoals = student.goals ?? [];

  const loadLogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    const result = await fetchStudentProgressLogs(student.id, goalFilterRpcValue(filter));
    setLogs(result.logs);
    setError(result.error);
    setLoading(false);
  }, [student.id, filter]);

  useEffect(() => {
    void loadLogs();
  }, [loadLogs, refreshKey]);

  const monthlyCounts = useMemo(() => buildMonthlyCounts(logs), [logs]);
  const maxCount = Math.max(1, ...monthlyCounts.map((b) => b.count));

  return (
    <div className="space-y-4">
      <div>
        <label
          htmlFor={`progress-history-goal-${student.id}`}
          className="mb-1 block text-xs font-medium text-zinc-600"
        >
          Filter by goal
        </label>
        <select
          id={`progress-history-goal-${student.id}`}
          value={filter === "all" ? "all" : filter === "general" ? "general" : String(filter)}
          onChange={(e) => {
            const v = e.target.value;
            if (v === "all") setFilter("all");
            else if (v === "general") setFilter("general");
            else setFilter(Number(v));
          }}
          className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
        >
          <option value="all">All goals</option>
          <option value="general">General (not tied to a goal)</option>
          {activeGoals.map((raw, i) => {
            const row = parseStoredGoal(raw);
            return (
              <option key={i} value={String(i)}>
                {storedGoalListLabel(raw, i) || row.title || `Goal ${i + 1}`}
              </option>
            );
          })}
        </select>
      </div>

      {monthlyCounts.length > 0 ? (
        <div className="rounded-lg border border-zinc-200/80 bg-zinc-50/60 p-3">
          <p className="text-xs font-medium text-zinc-500">Entries per month</p>
          <p className="mt-0.5 text-[11px] text-zinc-400">
            Numeric goal metrics will support trend lines here later.
          </p>
          <div className="mt-3 flex h-28 items-end gap-2">
            {monthlyCounts.map((bucket) => (
              <div key={bucket.key} className="flex min-w-0 flex-1 flex-col items-center gap-1">
                <span className="text-[10px] font-medium tabular-nums text-zinc-500">{bucket.count}</span>
                <div
                  className="w-full rounded-t bg-orange-500/80 transition-all"
                  style={{ height: `${(bucket.count / maxCount) * 100}%`, minHeight: bucket.count > 0 ? "4px" : 0 }}
                  title={`${bucket.count} entries`}
                />
                <span className="max-w-full truncate text-[10px] text-zinc-500">{bucket.label}</span>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {loading ? (
        <p className="text-sm text-zinc-500">Loading previous entries…</p>
      ) : error ? (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
        >
          {error}
          {error.toLowerCase().includes("function") || error.toLowerCase().includes("schema") ? (
            <p className="mt-1 text-xs">
              Run the updated <span className="font-mono">supabase-student-progress-log.sql</span> in Supabase,
              then reload the API schema cache.
            </p>
          ) : null}
        </div>
      ) : logs.length === 0 ? (
        <p className="text-sm text-zinc-500">No progress logged yet for this filter.</p>
      ) : (
        <ul className="space-y-2">
          {logs.map((log) => {
            const objective = objectiveLabel(student, log.goal_index, log.objective_index);
            return (
            <li
              key={log.id}
              className="rounded-lg border border-zinc-200/80 bg-white px-3 py-2.5 shadow-sm"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <time
                  dateTime={log.logged_on}
                  className="text-xs font-medium text-zinc-500"
                >
                  <FormattedLocalDateTime iso={log.logged_on} dateOnly dateStyle="medium" />
                </time>
                <div className="text-right">
                  <p className="text-[11px] font-medium text-orange-700">
                    {goalLabel(student, log.goal_index)}
                  </p>
                  {objective ? (
                    <p className="mt-0.5 text-[11px] text-zinc-500">{objective}</p>
                  ) : null}
                </div>
              </div>
              <p className="mt-1.5 whitespace-pre-wrap break-words text-sm text-zinc-700">
                {log.summary}
              </p>
            </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
