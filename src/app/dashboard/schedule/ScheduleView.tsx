"use client";

import { useActionState, useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Activity } from "@/types/activity";
import type { ScheduleEntry } from "@/types/schedule";
import {
  createScheduleEntry,
  deleteScheduleEntry,
  fetchScheduleEntries,
  updateScheduleEntry,
} from "./actions";
import type { UpdateScheduleEntryState } from "./actions";

function getWeekDates(anchor: Date): Date[] {
  const d = new Date(anchor);
  const day = d.getDay();
  const start = new Date(d);
  start.setDate(d.getDate() - day);
  start.setHours(0, 0, 0, 0);
  const out: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const x = new Date(start);
    x.setDate(start.getDate() + i);
    out.push(x);
  }
  return out;
}

function toDateKey(d: Date): string {
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
}

function getWeekRange(anchor: Date): { from: string; to: string } {
  const start = new Date(anchor);
  start.setDate(start.getDate() - start.getDay());
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  const toYMD = (x: Date) =>
    x.getFullYear() + "-" + String(x.getMonth() + 1).padStart(2, "0") + "-" + String(x.getDate()).padStart(2, "0");
  return { from: toYMD(start), to: toYMD(end) };
}

function formatDayShort(d: Date): string {
  return d.toLocaleDateString(undefined, { weekday: "short" });
}

function formatDateNum(d: Date): string {
  return String(d.getDate());
}

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

/** Normalize time string to HH:MM for input type="time" */
function timeToInputValue(timeStr: string): string {
  const s = (timeStr || "").trim();
  return s.slice(0, 5);
}

function minutesToTimeStr(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return String(h).padStart(2, "0") + ":" + String(m).padStart(2, "0");
}

const SLOT_START_HOUR = 7;
const SLOT_END_HOUR = 16;
const TOTAL_MINUTES = (SLOT_END_HOUR - SLOT_START_HOUR) * 60; // 540
const START_OFFSET_MINUTES = SLOT_START_HOUR * 60; // 420

const SLOT_INTERVAL_MINUTES = 15;

function getTimeSlots(): { hour: number; minute: number; label: string }[] {
  const slots: { hour: number; minute: number; label: string }[] = [];
  for (let h = SLOT_START_HOUR; h < SLOT_END_HOUR; h++) {
    for (let m = 0; m < 60; m += SLOT_INTERVAL_MINUTES) {
      slots.push({ hour: h, minute: m, label: formatTimeLabel(h, m) });
    }
  }
  return slots;
}

function overlaps(startA: number, endA: number, startB: number, endB: number): boolean {
  return startA < endB && startB < endA;
}

/**
 * For each entry, compute column index and total columns in its overlap band
 * so overlapping entries can be drawn side by side.
 */
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
  const result: { columnIndex: number; totalColumns: number }[] = rows.map(() => ({ columnIndex: 0, totalColumns: 1 }));

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
      const { startMin, endMin, index } = group[g];
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

type ScheduleViewProps = {
  initialEntries: ScheduleEntry[];
  activities: Activity[];
  canDeleteSchedule?: boolean;
};

export default function ScheduleView({ initialEntries, activities, canDeleteSchedule = false }: ScheduleViewProps) {
  const [anchor, setAnchor] = useState(() => new Date());
  const [selectedKey, setSelectedKey] = useState<string>(() => toDateKey(new Date()));
  const [entries, setEntries] = useState<ScheduleEntry[]>(() => Array.isArray(initialEntries) ? initialEntries : []);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<ScheduleEntry | null>(null);
  const [confirmDeleteEntryId, setConfirmDeleteEntryId] = useState<string | null>(null);
  const [activityPopup, setActivityPopup] = useState<Activity | null>(null);
  const [slotStart, setSlotStart] = useState({ hour: 8, minute: 0 });
  const [state, formAction] = useActionState(createScheduleEntry, { error: null });
  const [updateState, updateFormAction] = useActionState(updateScheduleEntry, { error: null } as UpdateScheduleEntryState);
  const prevErrorRef = useRef<string | null>(null);
  const prevUpdateErrorRef = useRef<string | null>(null);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  const weekDates = useMemo(() => getWeekDates(anchor), [anchor]);
  const timeSlots = useMemo(() => getTimeSlots(), []);
  const weekRange = useMemo(() => getWeekRange(anchor), [anchor]);

  const refetchEntries = useCallback(async () => {
    try {
      const result = await fetchScheduleEntries(weekRange.from, weekRange.to);
      const next = result?.entries;
      setEntries(Array.isArray(next) ? next : []);
    } catch {
      setEntries((prev) => (Array.isArray(prev) ? prev : []));
    }
  }, [weekRange.from, weekRange.to]);

  const refetchEntriesRef = useRef(refetchEntries);
  refetchEntriesRef.current = refetchEntries;

  const anchorRef = useRef(anchor);
  const isFirstMount = useRef(true);

  useEffect(() => {
    if (modalOpen && prevErrorRef.current !== null && state?.error === null) {
      setModalOpen(false);
      refetchEntriesRef.current();
    }
    prevErrorRef.current = state?.error ?? null;
  }, [state, modalOpen]);

  const updateSubmittedRef = useRef(false);

  useEffect(() => {
    if (!editingEntry) {
      updateSubmittedRef.current = false;
      setConfirmDeleteEntryId(null);
    }
  }, [editingEntry]);

  useEffect(() => {
    if (editingEntry && updateSubmittedRef.current && updateState?.error === null) {
      setEditingEntry(null);
      refetchEntriesRef.current();
      updateSubmittedRef.current = false;
    }
    prevUpdateErrorRef.current = updateState?.error ?? null;
  }, [updateState, editingEntry]);

  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      anchorRef.current = anchor;
      return;
    }
    if (anchorRef.current.getTime() !== anchor.getTime()) {
      anchorRef.current = anchor;
      refetchEntriesRef.current();
    }
  }, [anchor, refetchEntries]);

  const entriesForSelectedDay = useMemo(
    () => (Array.isArray(entries) ? entries : []).filter((e) => e.schedule_date === selectedKey),
    [entries, selectedKey]
  );

  const entryLayout = useMemo(() => computeEntryLayout(entriesForSelectedDay), [entriesForSelectedDay]);
  const activityById = useMemo(
    () => new Map(activities.map((a) => [a.id.toLowerCase(), a])),
    [activities]
  );

  const fourDayWindow = useMemo(() => {
    const todayKey = toDateKey(new Date());
    const todayIndex = weekDates.findIndex((d) => toDateKey(d) === todayKey);
    const idx = todayIndex >= 0 ? todayIndex : 0;
    const start = Math.max(0, Math.min(idx - 1, 3));
    return { start, end: start + 4 };
  }, [weekDates]);

  const fiveDayWindow = useMemo(() => {
    const todayKey = toDateKey(new Date());
    const todayIndex = weekDates.findIndex((d) => toDateKey(d) === todayKey);
    const idx = todayIndex >= 0 ? todayIndex : 0;
    const start = Math.max(0, Math.min(idx - 2, 2));
    return { start, end: start + 5 };
  }, [weekDates]);

  const selectedLabel = useMemo(() => {
    const d = new Date(selectedKey + "T12:00:00");
    return d.toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric", year: "numeric" });
  }, [selectedKey]);

  const todayKey = useMemo(() => toDateKey(now), [now]);
  const showNowLine = selectedKey === todayKey;
  const nowLineTopPct = useMemo(() => {
    const minNow = now.getHours() * 60 + now.getMinutes();
    const from7 = minNow - START_OFFSET_MINUTES;
    if (from7 <= 0) return 0;
    if (from7 >= TOTAL_MINUTES) return 100;
    return (from7 / TOTAL_MINUTES) * 100;
  }, [now]);

  const openModalForSlot = (hour: number, minute: number) => {
    setSlotStart({ hour, minute });
    setModalOpen(true);
  };

  const defaultStartTime = minutesToTimeStr(slotStart.hour * 60 + slotStart.minute);
  const defaultEndMinutes = slotStart.hour * 60 + slotStart.minute + SLOT_INTERVAL_MINUTES;
  const defaultEndTime = minutesToTimeStr(Math.min(defaultEndMinutes, SLOT_END_HOUR * 60));

  const goPrevWeek = () => {
    setAnchor((prev) => {
      const d = new Date(prev);
      d.setDate(d.getDate() - 7);
      return d;
    });
  };
  const goNextWeek = () => {
    setAnchor((prev) => {
      const d = new Date(prev);
      d.setDate(d.getDate() + 7);
      return d;
    });
  };

  const arrowClass =
    "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-zinc-200/80 bg-white/80 text-zinc-600 transition-colors hover:border-teal-400 hover:bg-teal-50 hover:text-teal-700 dark:border-zinc-700/50 dark:bg-zinc-800/60 dark:text-zinc-400 dark:hover:border-teal-700 dark:hover:bg-teal-900/40 dark:hover:text-teal-300 sm:h-10 sm:w-10";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center gap-2 sm:gap-3">
        <button type="button" onClick={goPrevWeek} className={arrowClass} aria-label="Previous week">
          <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>
        <div className="flex flex-1 flex-nowrap justify-center gap-1.5 overflow-x-auto pb-1 sm:gap-2 md:gap-3">
          {weekDates.map((d, i) => {
            const key = toDateKey(d);
            const isSelected = key === selectedKey;
            const inFourDay = i >= fourDayWindow.start && i < fourDayWindow.end;
            const inFiveDay = i >= fiveDayWindow.start && i < fiveDayWindow.end;
            const visibilityClass =
              inFourDay && inFiveDay
                ? "flex flex-col"
                : inFourDay
                  ? "flex flex-col md:hidden lg:flex lg:flex-col"
                  : inFiveDay
                    ? "hidden md:flex md:flex-col lg:flex lg:flex-col"
                    : "hidden lg:flex lg:flex-col";
            return (
              <button
                key={key}
                type="button"
                onClick={() => setSelectedKey(key)}
                className={`min-w-[2.5rem] flex-shrink-0 flex-col items-center rounded-lg border-2 px-2 py-1.5 transition-colors sm:min-w-[2.75rem] sm:rounded-xl sm:px-2.5 sm:py-2 md:min-w-[4rem] md:px-3 md:py-2 ${visibilityClass} ${
                  isSelected
                    ? "border-teal-500 bg-teal-500/20 text-teal-800 dark:border-teal-400 dark:bg-teal-400/20 dark:text-teal-100"
                    : "border-zinc-200/80 bg-white/70 text-zinc-700 hover:border-teal-300 hover:bg-teal-50/50 dark:border-zinc-700/50 dark:bg-zinc-800/60 dark:text-zinc-300 dark:hover:border-teal-700 dark:hover:bg-teal-900/30"
                }`}
              >
                <span className="text-[10px] font-medium text-zinc-500 dark:text-zinc-400 sm:text-xs">
                  {formatDayShort(d)}
                </span>
                <span className="mt-0.5 text-base font-bold tabular-nums sm:text-lg">{formatDateNum(d)}</span>
              </button>
            );
          })}
        </div>
        <button type="button" onClick={goNextWeek} className={arrowClass} aria-label="Next week">
          <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </button>
      </div>

      <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">{selectedLabel}</h2>

      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        Click a time slot to add an entry. Entries are visible to everyone in your organization.
      </p>

      <div className="overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-700">
        <div className="flex">
          <div className="relative w-20 shrink-0 flex flex-col border-r border-zinc-200 bg-zinc-50/80 dark:border-zinc-700 dark:bg-zinc-800/50">
            {timeSlots.map(({ hour, minute, label }, i) => (
              <button
                key={`${hour}-${minute}`}
                type="button"
                onClick={() => openModalForSlot(hour, minute)}
                className={`flex min-h-[2.75rem] w-full items-center justify-end border-b border-zinc-100 px-2 py-2 text-right text-xs font-medium tabular-nums text-zinc-600 transition-colors last:border-b-0 hover:bg-teal-50/80 hover:text-teal-700 dark:border-zinc-700/80 dark:text-zinc-400 dark:hover:bg-teal-900/30 dark:hover:text-teal-300 ${
                  i % 2 === 0 ? "bg-white dark:bg-zinc-900/80" : "bg-zinc-100/80 dark:bg-zinc-800/80"
                }`}
                aria-label={`Add entry at ${label}`}
              >
                {label}
              </button>
            ))}
            {showNowLine && (
              <div
                className="absolute left-0 right-0 h-0.5 bg-red-500 z-10 pointer-events-none"
                style={{ top: `${nowLineTopPct}%` }}
                aria-hidden
              />
            )}
          </div>
          <div className="relative flex-1 flex flex-col" style={{ minHeight: timeSlots.length * 2.75 * 4 }}>
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {entriesForSelectedDay.map((entry, i) => {
                const startMin = timeToMinutes(entry.start_time);
                const endMin = timeToMinutes(entry.end_time);
                const from7 = startMin - START_OFFSET_MINUTES;
                const duration = endMin - startMin;
                const topPct = (from7 / TOTAL_MINUTES) * 100;
                const heightPct = (duration / TOTAL_MINUTES) * 100;
                if (from7 < 0 || from7 + duration > TOTAL_MINUTES) return null;
                const { columnIndex, totalColumns } = entryLayout[i] ?? { columnIndex: 0, totalColumns: 1 };
                const inset = 1;
                const available = 100 - inset * 2;
                const gapPct = totalColumns > 1 ? 0.4 : 0;
                const widthPct = available / totalColumns - gapPct;
                const leftPct = inset + columnIndex * (available / totalColumns) + gapPct / 2;
                const activity = entry.activity_id
                  ? activityById.get(String(entry.activity_id).toLowerCase())
                  : null;
                return (
                  <div
                    key={entry.id}
                    className="absolute pointer-events-auto flex items-stretch gap-0.5 rounded overflow-hidden bg-teal-500/90 shadow dark:bg-teal-600/90"
                    style={{
                      top: `${topPct}%`,
                      height: `${heightPct}%`,
                      minHeight: "1.25rem",
                      left: `${leftPct}%`,
                      width: `${widthPct}%`,
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => setEditingEntry(entry)}
                      className="flex-1 min-w-0 px-2 py-0.5 text-center text-xs font-medium text-white hover:bg-teal-600/90 dark:hover:bg-teal-500/90 cursor-pointer"
                      title={entry.name}
                    >
                      <span className="line-clamp-2 block">{entry.name}</span>
                    </button>
                    {activity && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActivityPopup(activity);
                        }}
                        className="shrink-0 flex items-center justify-center w-9 text-white/95 hover:bg-white/25 hover:text-white rounded-r"
                        title={`Open ${activity.name}`}
                        aria-label={`Open activity: ${activity.name}`}
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" />
                        </svg>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
            {timeSlots.map(({ hour, minute }, i) => (
              <button
                key={`${hour}-${minute}`}
                type="button"
                onClick={() => openModalForSlot(hour, minute)}
                className={`min-h-[2.75rem] flex-1 border-b border-zinc-100 px-2 py-1 text-left transition-colors last:border-b-0 dark:border-zinc-700/80 hover:bg-teal-50/50 dark:hover:bg-teal-900/20 ${
                  i % 2 === 0 ? "bg-white dark:bg-zinc-900/80" : "bg-zinc-100/80 dark:bg-zinc-800/80"
                }`}
                aria-label={`Add entry at ${formatTimeLabel(hour, minute)}`}
              />
            ))}
          </div>
        </div>
      </div>

      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          aria-modal="true"
          role="dialog"
          aria-labelledby="schedule-modal-title"
        >
          <div className="w-full max-w-md rounded-xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-700 dark:bg-zinc-900">
            <h3 id="schedule-modal-title" className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              Add schedule entry
            </h3>
            <form action={formAction} className="mt-4 space-y-4">
              <input type="hidden" name="schedule_date" value={selectedKey} />
              {state?.error && (
                <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-300">
                  {state.error}
                </p>
              )}
              <div>
                <label htmlFor="schedule-name" className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Name
                </label>
                <input
                  id="schedule-name"
                  name="name"
                  type="text"
                  required
                  placeholder="e.g. Reading block"
                  className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
                />
              </div>
              <div>
                <label htmlFor="schedule-activity" className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Activity (optional)
                </label>
                <select
                  id="schedule-activity"
                  name="activity_id"
                  className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
                >
                  <option value="">None</option>
                  {activities.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="schedule-start" className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Start
                  </label>
                  <input
                    id="schedule-start"
                    name="start_time"
                    type="time"
                    required
                    defaultValue={defaultStartTime}
                    className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
                  />
                </div>
                <div>
                  <label htmlFor="schedule-end" className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    End
                  </label>
                  <input
                    id="schedule-end"
                    name="end_time"
                    type="time"
                    required
                    defaultValue={defaultEndTime}
                    className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
                  />
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600"
                >
                  Add entry
                </button>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editingEntry && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          aria-modal="true"
          role="dialog"
          aria-labelledby="schedule-edit-modal-title"
          onClick={() => {
            setConfirmDeleteEntryId(null);
            setEditingEntry(null);
          }}
        >
          <div
            className="w-full max-w-md rounded-xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-700 dark:bg-zinc-900"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 id="schedule-edit-modal-title" className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              Edit schedule entry
            </h3>
            <form
              key={editingEntry.id}
              action={updateFormAction}
              onSubmit={() => {
                updateSubmittedRef.current = true;
              }}
              className="mt-4 space-y-4"
            >
              <input type="hidden" name="id" value={editingEntry.id} />
              <input type="hidden" name="schedule_date" value={editingEntry.schedule_date} />
              {updateState?.error && (
                <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-300">
                  {updateState.error}
                </p>
              )}
              <div>
                <label htmlFor="edit-schedule-name" className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Name
                </label>
                <input
                  id="edit-schedule-name"
                  name="name"
                  type="text"
                  required
                  defaultValue={editingEntry.name}
                  placeholder="e.g. Reading block"
                  className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
                />
              </div>
              <div>
                <label htmlFor="edit-schedule-activity" className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Activity (optional)
                </label>
                <select
                  id="edit-schedule-activity"
                  name="activity_id"
                  defaultValue={editingEntry.activity_id ?? ""}
                  className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
                >
                  <option value="">None</option>
                  {activities.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="edit-schedule-start" className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Start
                  </label>
                  <input
                    id="edit-schedule-start"
                    name="start_time"
                    type="time"
                    required
                    defaultValue={timeToInputValue(editingEntry.start_time)}
                    className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
                  />
                </div>
                <div>
                  <label htmlFor="edit-schedule-end" className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    End
                  </label>
                  <input
                    id="edit-schedule-end"
                    name="end_time"
                    type="time"
                    required
                    defaultValue={timeToInputValue(editingEntry.end_time)}
                    className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-2 pt-2">
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingEntry(null)}
                    className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                  >
                    Cancel
                  </button>
                </div>
                {canDeleteSchedule && (
                  <button
                    type="button"
                    onClick={async () => {
                      if (confirmDeleteEntryId !== editingEntry.id) {
                        setConfirmDeleteEntryId(editingEntry.id);
                        return;
                      }
                      const result = await deleteScheduleEntry(editingEntry.id);
                      if (!result?.error) {
                        setConfirmDeleteEntryId(null);
                        setEditingEntry(null);
                        refetchEntries();
                      } else {
                        alert(result.error);
                      }
                    }}
                    className={
                      confirmDeleteEntryId === editingEntry.id
                        ? "rounded-lg border-2 border-red-600 bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 hover:border-red-700 dark:border-red-500 dark:bg-red-600 dark:hover:bg-red-700 dark:hover:border-red-700"
                        : "rounded-lg border border-red-300 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100 dark:border-red-800 dark:bg-red-900/30 dark:text-red-300 dark:hover:bg-red-900/50"
                    }
                  >
                    {confirmDeleteEntryId === editingEntry.id ? "Confirm Delete" : "Delete"}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {activityPopup && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          aria-modal="true"
          role="dialog"
          aria-labelledby="activity-popup-title"
        >
          <div className="w-full max-w-md rounded-xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-700 dark:bg-zinc-900">
            <div className="flex items-start justify-between gap-2">
              <h3 id="activity-popup-title" className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                {activityPopup.name}
              </h3>
              <button
                type="button"
                onClick={() => setActivityPopup(null)}
                className="shrink-0 rounded p-1 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
                aria-label="Close"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {activityPopup.image_url && (
              <div className="mt-3 overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-800">
                <img
                  src={activityPopup.image_url}
                  alt=""
                  className="h-48 w-full object-cover"
                />
              </div>
            )}
            {activityPopup.description && (
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{activityPopup.description}</p>
            )}
            {activityPopup.activity_type && (
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-500">
                Type: {activityPopup.activity_type}
              </p>
            )}
            {activityPopup.youtube_url && (
              <div className="mt-4">
                <a
                  href={activityPopup.youtube_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                  Open YouTube
                </a>
              </div>
            )}
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setActivityPopup(null)}
                className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
