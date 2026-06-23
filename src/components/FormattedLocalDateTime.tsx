"use client";

import { useEffect, useState } from "react";

type FormattedLocalDateTimeProps = {
  iso: string | null | undefined;
  fallback?: string;
  dateStyle?: "short" | "medium" | "long" | "full";
  timeStyle?: "short" | "medium" | "long" | "full";
};

/** Formats ISO timestamps in the viewer's local timezone (avoids UTC SSR showing the wrong day). */
export default function FormattedLocalDateTime({
  iso,
  fallback = "—",
  dateStyle = "medium",
  timeStyle = "short",
}: FormattedLocalDateTimeProps) {
  const [text, setText] = useState(fallback);

  useEffect(() => {
    if (!iso) {
      setText(fallback);
      return;
    }
    try {
      setText(
        new Date(iso).toLocaleString(undefined, {
          dateStyle,
          timeStyle,
        })
      );
    } catch {
      setText(fallback);
    }
  }, [iso, fallback, dateStyle, timeStyle]);

  return <span suppressHydrationWarning>{text}</span>;
}
