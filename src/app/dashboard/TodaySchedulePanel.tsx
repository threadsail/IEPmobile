"use client";

import Link from "next/link";
import { fetchScheduleEntries } from "@/app/dashboard/schedule/actions";
import type { ScheduleEntry } from "@/types/schedule";
import { getWeekRange, toDateKey } from "@/utils/schedule-dates";
import { useEffect, useMemo, useState } from "react";

const SLOT_START_HOUR = 7;
const SLOT_END_HOUR = 16;
const HOUR_COUNT = SLOT_END_HOUR - SLOT_START_HOUR;
const TOTAL_MINUTES = HOUR_COUNT * 60;
const START_OFFSET_MINUTES = SLOT_START_HOUR * 60;
const ENTRY_EDGE_GAP_PX = 2;
const ROW_HEIGHT_CLASS = "h-6 sm:h-7";

function formatTimeLabel(h: number, m: number): string {
  const am = h < 12;
  const hour = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${hour}:${String(m).padStart(2, "0")} ${am ? "AM" : "PM"}`;
}

function timeToMinutes(timeStr: string): number {
  const part = (timeStr || "").trim().split(":");
  const h = parseInt(part[0] ?? "0", 10);
  const m = parseInt(part[1] ?? "0", 10);
  return h * 60 + m;
}

function getHourSlots(): { hour: number; label: string }[] {
  const slots: { hour: number; label: string }[] = [];
  for (let h = SLOT_START_HOUR; h < SLOT_END_HOUR; h++) {
    slots.push({ hour: h, label: formatTimeLabel(h, 0) });
  }
  return slots;
}

function overlaps(startA: number, endA: number, startB: number, endB: number): boolean {
  return startA < endB && startB < endA;
}

function computeEntryLayout(
  entries: ScheduleEntry[]
): { columnIndex: number; totalColumns: number }[] {
  type Row = { startMin: number; endMin: number; index: number };
  const rows: Row[] = entries.map((e, i) => ({
    startMin: timeToMinutes(e.start_time),
    endMin: timeToMinutes(e.end_time),
    index: i,
  }));

  const n = rows.length;
  if (n === 0) return [];
  const result: { columnIndex: number; totalColumns: number }[] = rows.map(() => ({
    columnIndex: 0,
    totalColumns: 1,
  }));

  const parent: number[] = Array.from({ length: n }, (_, i) => i);
  const find = (i: number): number => (parent[i] === i ? i : (parent[i] = find(parent[i])));
  const union = (a: number, b: number) => {
    parent[find(a)] = find(b);
  };
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      if (overlaps(rows[i].startMin, rows[i].endMin, rows[j].startMin, rows[j].endMin)) union(i, j);
    }
  }

  const componentRows = new Map<number, Row[]>();
  for (let i = 0; i < n; i++) {
    const root = find(i);
    if (!componentRows.has(root)) componentRows.set(root, []);
    componentRows.get(root)!.push(rows[i]);
  }

  for (const group of componentRows.values()) {
    group.sort((a, b) => a.startMin - b.startMin || a.endMin - b.endMin);
    const columnEnd: number[] = [];
    const entryColumn: number[] = Array(group.length).fill(-1);
    for (let g = 0; g < group.length; g++) {
      const { startMin, endMin } = group[g];
      let col = 0;
      while (col < columnEnd.length && columnEnd[col] > startMin) col++;
      if (col === columnEnd.length) columnEnd.push(0);
      entryColumn[g] = col;
      columnEnd[col] = endMin;
    }
    const totalColumns = columnEnd.length;
    for (let g = 0; g < group.length; g++) {
      result[group[g].index] = { columnIndex: entryColumn[g], totalColumns };
    }
  }
  return result;
}

type TodaySchedulePanelProps = {
  ownerUserId: string | null;
  initialEntries: ScheduleEntry[];
};

export default function TodaySchedulePanel({ ownerUserId, initialEntries }: TodaySchedulePanelProps) {
  const [todayKey, setTodayKey] = useState(() => toDateKey(new Date()));
  const [now, setNow] = useState(() => new Date());
  const [entries, setEntries] = useState<ScheduleEntry[]>(() =>
    Array.isArray(initialEntries) ? initialEntries : []
  );

  const hourSlots = useMemo(() => getHourSlots(), []);

  useEffect(() => {
    const refresh = () => {
      setTodayKey(toDateKey(new Date()));
      setNow(new Date());
    };
    refresh();
    const id = window.setInterval(refresh, 60_000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    if (!ownerUserId) {
      setEntries([]);
      return;
    }
    const { from, to } = getWeekRange(new Date());
    void (async () => {
      try {
        const result = await fetchScheduleEntries(from, to, ownerUserId);
        setEntries(Array.isArray(result.entries) ? result.entries : []);
      } catch {
        setEntries([]);
      }
    })();
  }, [ownerUserId, todayKey]);

  const entriesForToday = useMemo(
    () => entries.filter((e) => e.schedule_date === todayKey),
    [entries, todayKey]
  );
  const entryLayout = useMemo(() => computeEntryLayout(entriesForToday), [entriesForToday]);

  const nowLineTopPct = useMemo(() => {
    const minNow = now.getHours() * 60 + now.getMinutes();
    const from7 = minNow - START_OFFSET_MINUTES;
    if (from7 <= 0) return 0;
    if (from7 >= TOTAL_MINUTES) return 100;
    return (from7 / TOTAL_MINUTES) * 100;
  }, [now]);

  if (!ownerUserId) {
    return (
      <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
        Sign in to view your schedule.
      </p>
    );
  }

  return (
    <div className="mt-2 overflow-hidden rounded-md border border-zinc-200 dark:border-zinc-700 sm:mt-4">
      <div className="flex">
        <div className={`relative w-14 shrink-0 border-r border-zinc-200 bg-zinc-50/80 dark:border-zinc-700 dark:bg-zinc-800/50 sm:w-16 md:w-20`}>
          {hourSlots.map(({ hour, label }, i) => (
            <div
              key={hour}
              className={`flex ${ROW_HEIGHT_CLASS} items-center justify-end border-b border-zinc-100 px-1.5 text-right text-[10px] font-medium tabular-nums text-zinc-600 last:border-b-0 dark:border-zinc-700/80 dark:text-zinc-400 sm:px-2 sm:text-xs ${
                i % 2 === 0 ? "bg-white dark:bg-zinc-900/80" : "bg-zinc-100/80 dark:bg-zinc-800/80"
              }`}
            >
              {label}
            </div>
          ))}
          <div
            className="pointer-events-none absolute left-0 right-0 z-10 h-px bg-red-500"
            style={{ top: `${nowLineTopPct}%` }}
            aria-hidden
          />
        </div>
        <div className={`relative flex-1`}>
          <div className="flex flex-col">
            {hourSlots.map(({ hour }, i) => (
              <div
                key={`slot-${hour}`}
                className={`${ROW_HEIGHT_CLASS} border-b border-zinc-100 last:border-b-0 dark:border-zinc-700/80 ${
                  i % 2 === 0 ? "bg-white dark:bg-zinc-900/40" : "bg-zinc-50/50 dark:bg-zinc-800/30"
                }`}
              />
            ))}
          </div>
          <div className="absolute inset-0 overflow-hidden">
            {entriesForToday.length === 0 ? (
              <p className="absolute inset-0 flex items-center justify-center px-3 text-center text-xs text-zinc-500 dark:text-zinc-400 sm:text-sm">
                No entries today.{" "}
                <Link href="/dashboard/schedule" className="ml-1 text-blue-600 hover:underline dark:text-blue-400">
                  Add to schedule
                </Link>
              </p>
            ) : null}
            {entriesForToday.map((entry, i) => {
              const startMin = timeToMinutes(entry.start_time);
              const endMin = timeToMinutes(entry.end_time);
              const from7 = startMin - START_OFFSET_MINUTES;
              const duration = endMin - startMin;
              const topPct = (from7 / TOTAL_MINUTES) * 100;
              const heightPct = (duration / TOTAL_MINUTES) * 100;
              if (from7 < 0 || from7 + duration > TOTAL_MINUTES) return null;
              const { columnIndex, totalColumns } = entryLayout[i] ?? { columnIndex: 0, totalColumns: 1 };
              const inset = 1.5;
              const available = 100 - inset * 2;
              const colGapPct = totalColumns > 1 ? 1.2 : 0;
              const widthPct = available / totalColumns - colGapPct;
              const leftPct = inset + columnIndex * (available / totalColumns) + colGapPct / 2;
              return (
                <Link
                  key={entry.id}
                  href="/dashboard/schedule"
                  className="absolute block overflow-hidden rounded border border-zinc-300 bg-zinc-200 px-1 py-0.5 text-[10px] font-medium text-zinc-900 shadow-sm ring-1 ring-zinc-900/5 transition-colors hover:bg-zinc-300 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-100 dark:ring-white/10 dark:hover:bg-zinc-600 sm:px-1.5 sm:text-xs"
                  style={{
                    top: `calc(${topPct}% + ${ENTRY_EDGE_GAP_PX}px)`,
                    height: `calc(${heightPct}% - ${ENTRY_EDGE_GAP_PX * 2}px)`,
                    minHeight: "1.25rem",
                    left: `${leftPct}%`,
                    width: `${widthPct}%`,
                  }}
                  title={entry.name}
                >
                  <span className="line-clamp-2 leading-tight">{entry.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
