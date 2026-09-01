/** Sunday = 0 … Saturday = 6 (matches schedule calendar). */
export const WEEKDAY_OPTIONS = [
  { value: 0, label: "Sun" },
  { value: 1, label: "Mon" },
  { value: 2, label: "Tue" },
  { value: 3, label: "Wed" },
  { value: 4, label: "Thu" },
  { value: 5, label: "Fri" },
  { value: 6, label: "Sat" },
] as const;

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

export function weekdayFromYmd(ymd: string): number | null {
  const d = parseYmd(ymd);
  if (Number.isNaN(d.getTime())) return null;
  return d.getDay();
}

/**
 * From start date, repeat on selected weekdays for `weeks` weeks (inclusive of start week).
 */
export function getWeeklyRepeatScheduleDates(
  startDate: string,
  weeks: number,
  daysOfWeek: number[]
): string[] {
  const start = parseYmd(startDate);
  if (Number.isNaN(start.getTime())) return [];

  const daySet = new Set(daysOfWeek.filter((d) => d >= 0 && d <= 6));
  if (daySet.size === 0) return [];

  const weekCount = Math.max(1, Math.min(weeks, 26));
  const dates = new Set<string>();

  for (let i = 0; i < weekCount * 7; i++) {
    const cursor = addDays(start, i);
    if (daySet.has(cursor.getDay())) {
      dates.add(toYmd(cursor));
    }
  }

  return [...dates].sort();
}

export function parseRepeatDays(formData: FormData): number[] {
  const raw = formData.getAll("repeat_days");
  const days = new Set<number>();
  for (const value of raw) {
    const n = Number(value);
    if (Number.isInteger(n) && n >= 0 && n <= 6) days.add(n);
  }
  return [...days].sort((a, b) => a - b);
}
