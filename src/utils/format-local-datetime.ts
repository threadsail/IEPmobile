/**
 * Parse API/Postgres timestamps for display in the viewer's local timezone.
 * Strings without a timezone are treated as UTC (Supabase timestamptz convention).
 */
export function parseApiTimestamp(iso: string): Date {
  const s = iso.trim();

  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
    const [y, m, d] = s.split("-").map(Number);
    return new Date(Date.UTC(y, m - 1, d));
  }

  if (/^\d{4}-\d{2}-\d{2} \d/.test(s) && !s.includes("T")) {
    return new Date(s.replace(" ", "T") + (s.includes("+") || s.endsWith("Z") ? "" : "Z"));
  }

  if (/^\d{4}-\d{2}-\d{2}T/.test(s) && !/([zZ]|[+-]\d{2}:\d{2})$/.test(s)) {
    return new Date(`${s}Z`);
  }

  return new Date(s);
}

export function formatLocalDateTime(
  iso: string | null | undefined,
  options?: { dateStyle?: "short" | "medium" | "long" | "full"; timeStyle?: "short" | "medium" | "long" | "full" }
): string {
  if (!iso) return "—";
  try {
    const { dateStyle = "medium", timeStyle = "short" } = options ?? {};
    return parseApiTimestamp(iso).toLocaleString(undefined, { dateStyle, timeStyle });
  } catch {
    return "—";
  }
}

export function formatLocalDate(
  iso: string | null | undefined,
  dateStyle: "short" | "medium" | "long" | "full" = "long"
): string {
  if (!iso) return "—";
  try {
    return parseApiTimestamp(iso).toLocaleDateString(undefined, { dateStyle });
  } catch {
    return "—";
  }
}

/** Account signup time — prefer auth.users.created_at over profile row created_at. */
export function accountCreatedIso(
  userCreatedAt: string | null | undefined,
  profileCreatedAt: string | null | undefined
): string | null {
  return userCreatedAt ?? profileCreatedAt ?? null;
}
