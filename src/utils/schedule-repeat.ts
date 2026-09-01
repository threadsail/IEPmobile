export type ScheduleRepeat = "none" | "daily" | "weekdays" | "weekly";

function parseYmd(ymd: string): Date {
  const [y, m, d] = ymd.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

function toYmd(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function addDays(d: Date, days: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + days);
  return x;
}

/** Sunday–Saturday week; returns Saturday of the week containing `d`. */
function saturdayOfWeek(d: Date): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + (6 - x.getDay()));
  return x;
}

/**
 * Dates to create schedule entries for, starting at `startDate` (YYYY-MM-DD).
 */
export function getRepeatScheduleDates(startDate: string, repeat: ScheduleRepeat): string[] {
  const start = parseYmd(startDate);
  if (Number.isNaN(start.getTime())) return [];

  if (repeat === "none") return [startDate];

  const dates = new Set<string>();
  dates.add(startDate);

  if (repeat === "daily") {
    const end = saturdayOfWeek(start);
    for (let cursor = addDays(start, 1); cursor <= end; cursor = addDays(cursor, 1)) {
      dates.add(toYmd(cursor));
    }
    return [...dates].sort();
  }

  if (repeat === "weekdays") {
    for (let i = 1; i < 14; i++) {
      const cursor = addDays(start, i);
      const dow = cursor.getDay();
      if (dow >= 1 && dow <= 5) dates.add(toYmd(cursor));
    }
    return [...dates].sort();
  }

  if (repeat === "weekly") {
    for (let w = 1; w < 4; w++) {
      dates.add(toYmd(addDays(start, w * 7)));
    }
    return [...dates].sort();
  }

  return [startDate];
}

export const SCHEDULE_REPEAT_OPTIONS: { value: ScheduleRepeat; label: string }[] = [
  { value: "none", label: "Don't repeat" },
  { value: "daily", label: "Daily (through Saturday this week)" },
  { value: "weekdays", label: "Weekdays (2 weeks)" },
  { value: "weekly", label: "Weekly (4 weeks)" },
];
