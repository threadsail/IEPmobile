"use client";

import { formatLocalToday } from "@/utils/format-local-datetime";
import { useEffect, useState } from "react";

type LocalTodayDateProps = {
  className?: string;
};

/**
 * Renders today's date in the viewer's local timezone.
 * Server-rendered pages use UTC and can show tomorrow after ~4pm US Pacific.
 */
export default function LocalTodayDate({ className }: LocalTodayDateProps) {
  const [label, setLabel] = useState<string | null>(null);

  useEffect(() => {
    const refresh = () => setLabel(formatLocalToday());
    refresh();
    const id = window.setInterval(refresh, 60_000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <p className={className} suppressHydrationWarning>
      {label ?? "\u00a0"}
    </p>
  );
}
