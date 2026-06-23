"use client";

import {
  formatLocalDate,
  formatLocalDateTime,
} from "@/utils/format-local-datetime";

type FormattedLocalDateTimeProps = {
  iso: string | number | null | undefined;
  fallback?: string;
  dateStyle?: "short" | "medium" | "long" | "full";
  timeStyle?: "short" | "medium" | "long" | "full";
  /** When true, shows calendar date only (no time). */
  dateOnly?: boolean;
};

/** Formats timestamps in the viewer's local timezone (client render only). */
export default function FormattedLocalDateTime({
  iso,
  fallback = "—",
  dateStyle = "medium",
  timeStyle = "short",
  dateOnly = false,
}: FormattedLocalDateTimeProps) {
  if (typeof window === "undefined" || iso == null || iso === "") {
    return <span suppressHydrationWarning>{fallback}</span>;
  }

  const text = dateOnly
    ? formatLocalDate(iso, dateStyle)
    : formatLocalDateTime(iso, { dateStyle, timeStyle });

  return <span suppressHydrationWarning>{text}</span>;
}
