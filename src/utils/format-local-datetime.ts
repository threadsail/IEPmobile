/**
 * Normalize Supabase / Postgres timestamps to epoch ms (UTC instant).
 */
export function parseApiTimestampToMs(iso: string | number): number | null {
  if (typeof iso === "number") {
    if (!Number.isFinite(iso)) return null;
    return iso < 1e12 ? iso * 1000 : iso;
  }

  let s = iso.trim();
  if (!s) return null;

  // Date-only → UTC midnight
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
    s = `${s}T00:00:00Z`;
  } else if (/^\d{4}-\d{2}-\d{2} \d/.test(s) && !s.includes("T")) {
    s = s.replace(" ", "T");
  }

  // Postgres short offset +00 → +00:00
  s = s.replace(/([+-]\d{2})$/, "$1:00");

  // Datetime without timezone → UTC (Supabase timestamptz over the wire)
  if (/^\d{4}-\d{2}-\d{2}T/.test(s) && !/[zZ]|[+-]\d{2}:\d{2}/.test(s.slice(10))) {
    s = `${s.replace(/\.\d+$/, "")}Z`;
  }

  // Trim fractional seconds >3 digits for JS Date.parse
  s = s.replace(/(\.\d{3})\d+(?=[zZ+-])/, "$1");

  const ms = Date.parse(s);
  return Number.isNaN(ms) ? null : ms;
}

export function parseApiTimestamp(iso: string | number): Date {
  const ms = parseApiTimestampToMs(iso);
  if (ms === null) {
    throw new RangeError(`Invalid timestamp: ${iso}`);
  }
  return new Date(ms);
}

export function formatLocalDateTime(
  iso: string | number | null | undefined,
  options?: {
    dateStyle?: "short" | "medium" | "long" | "full";
    timeStyle?: "short" | "medium" | "long" | "full";
  }
): string {
  if (iso == null || iso === "") return "—";
  const ms = parseApiTimestampToMs(iso);
  if (ms === null) return "—";
  try {
    const { dateStyle = "medium", timeStyle = "short" } = options ?? {};
    return new Date(ms).toLocaleString(undefined, { dateStyle, timeStyle });
  } catch {
    return "—";
  }
}

export function formatLocalDate(
  iso: string | number | null | undefined,
  dateStyle: "short" | "medium" | "long" | "full" = "long"
): string {
  if (iso == null || iso === "") return "—";
  const ms = parseApiTimestampToMs(iso);
  if (ms === null) return "—";
  try {
    return new Date(ms).toLocaleDateString(undefined, { dateStyle });
  } catch {
    return "—";
  }
}

/** Prefer auth.users.created_at (account signup), then profile row. */
export function accountCreatedIso(
  authCreatedAt: string | null | undefined,
  profileCreatedAt: string | null | undefined
): string | null {
  return authCreatedAt ?? profileCreatedAt ?? null;
}
