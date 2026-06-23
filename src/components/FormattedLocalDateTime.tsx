"use client";

import {
  formatLocalDate,
  formatLocalDateTime,
  parseApiTimestamp,
} from "@/utils/format-local-datetime";
import { useEffect, useState } from "react";

type FormattedLocalDateTimeProps = {
  iso: string | null | undefined;
  fallback?: string;
  dateStyle?: "short" | "medium" | "long" | "full";
  timeStyle?: "short" | "medium" | "long" | "full";
  /** When true, shows calendar date only (no time). */
  dateOnly?: boolean;
};

/** Formats ISO timestamps in the viewer's local timezone after mount. */
export default function FormattedLocalDateTime({
  iso,
  fallback = "—",
  dateStyle = "medium",
  timeStyle = "short",
  dateOnly = false,
}: FormattedLocalDateTimeProps) {
  const [text, setText] = useState(fallback);

  useEffect(() => {
    if (!iso) {
      setText(fallback);
      return;
    }
    setText(
      dateOnly
        ? formatLocalDate(iso, dateStyle)
        : formatLocalDateTime(iso, { dateStyle, timeStyle })
    );
  }, [iso, fallback, dateStyle, timeStyle, dateOnly]);

  return <span suppressHydrationWarning>{text}</span>;
}

export { parseApiTimestamp };
