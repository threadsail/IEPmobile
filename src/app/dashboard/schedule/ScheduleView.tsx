"use client";

import { useMemo, useState } from "react";

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

function formatDayShort(d: Date): string {
  return d.toLocaleDateString(undefined, { weekday: "short" });
}

function formatDateNum(d: Date): string {
  return String(d.getDate());
}

function formatTimeLabel(h: number, m: number): string {
  const am = h < 12;
  const hour = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${hour}:${m === 0 ? "00" : "30"} ${am ? "AM" : "PM"}`;
}

const SLOT_START_HOUR = 7;
const SLOT_END_HOUR = 16;

function getTimeSlots(): { hour: number; minute: number; label: string }[] {
  const slots: { hour: number; minute: number; label: string }[] = [];
  for (let h = SLOT_START_HOUR; h < SLOT_END_HOUR; h++) {
    slots.push({ hour: h, minute: 0, label: formatTimeLabel(h, 0) });
    slots.push({ hour: h, minute: 30, label: formatTimeLabel(h, 30) });
  }
  return slots;
}

export default function ScheduleView() {
  const [anchor, setAnchor] = useState(() => new Date());
  const [selectedKey, setSelectedKey] = useState<string>(() => toDateKey(new Date()));

  const weekDates = useMemo(() => getWeekDates(anchor), [anchor]);
  const timeSlots = useMemo(() => getTimeSlots(), []);

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
      {/* Week row: left arrow, dates, right arrow */}
      <div className="flex items-center justify-center gap-2 sm:gap-3">
        <button
          type="button"
          onClick={goPrevWeek}
          className={arrowClass}
          aria-label="Previous week"
        >
          <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>
        <div className="flex flex-1 flex-nowrap justify-center gap-1.5 overflow-x-auto pb-1 transition-[gap] duration-200 ease-out sm:gap-2 md:gap-3">
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
              className={`min-w-[2.5rem] flex-shrink-0 flex-col items-center rounded-lg border-2 px-2 py-1.5 transition-[color,background-color,border-color,width,height,font-size,padding] duration-200 ease-out sm:min-w-[2.75rem] sm:rounded-xl sm:px-2.5 sm:py-2 md:min-w-[4rem] md:px-3 md:py-2 ${visibilityClass} ${
                isSelected
                  ? "border-teal-500 bg-teal-500/20 text-teal-800 dark:border-teal-400 dark:bg-teal-400/20 dark:text-teal-100"
                  : "border-zinc-200/80 bg-white/70 text-zinc-700 hover:border-teal-300 hover:bg-teal-50/50 dark:border-zinc-700/50 dark:bg-zinc-800/60 dark:text-zinc-300 dark:hover:border-teal-700 dark:hover:bg-teal-900/30"
              }`}
            >
              <span className="text-[10px] font-medium text-zinc-500 transition-[font-size] duration-200 ease-out dark:text-zinc-400 sm:text-xs">
                {formatDayShort(d)}
              </span>
              <span className="mt-0.5 text-base font-bold tabular-nums transition-[font-size] duration-200 ease-out sm:text-lg">
                {formatDateNum(d)}
              </span>
            </button>
          );
        })}
        </div>
        <button
          type="button"
          onClick={goNextWeek}
          className={arrowClass}
          aria-label="Next week"
        >
          <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </button>
      </div>

      {/* Selected date heading */}
      <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">{selectedLabel}</h2>

      {/* Day grid: 7am–4pm, 30-min intervals */}
      <div className="overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-700">
        {timeSlots.map(({ hour, minute, label }) => (
          <div
            key={`${hour}-${minute}`}
            className="flex min-h-[2.75rem] items-stretch border-b border-zinc-100 last:border-b-0 dark:border-zinc-700/80"
          >
            <div className="w-20 shrink-0 border-r border-zinc-200 bg-zinc-50/80 px-2 py-2 text-right text-xs font-medium tabular-nums text-zinc-600 dark:border-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-400">
              {label}
            </div>
            <div className="min-h-[2.75rem] flex-1 px-2 py-2 text-sm text-zinc-500 dark:text-zinc-400" />
          </div>
        ))}
      </div>
    </div>
  );
}
