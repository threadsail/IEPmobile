const PREFIX = "iep1:";

export type ParsedGoal = { title: string; description: string };

/** Decode a stored goal string (legacy plain text or structured). */
export function parseStoredGoal(raw: string): ParsedGoal {
  const s = typeof raw === "string" ? raw : "";
  if (s.startsWith(PREFIX)) {
    try {
      const j = JSON.parse(s.slice(PREFIX.length)) as unknown;
      if (j && typeof j === "object") {
        const o = j as { t?: unknown; d?: unknown };
        return {
          title: typeof o.t === "string" ? o.t : "",
          description: typeof o.d === "string" ? o.d : "",
        };
      }
    } catch {
      /* fall through */
    }
  }
  return { title: s.trim(), description: "" };
}

/** Encode for RPC / DB; empty goals return "" and are dropped by callers. */
export function serializeGoal(title: string, description: string): string {
  const t = title.trim();
  const d = description.trim();
  if (!t && !d) return "";
  return `${PREFIX}${JSON.stringify({ t, d })}`;
}

/** Display title for lists (full title, not truncated). */
export function storedGoalTitle(raw: string, index: number): string {
  const { title, description } = parseStoredGoal(raw);
  if (title.trim()) return title.trim();
  const firstLine = description
    .trim()
    .split(/\r?\n/)
    .find((l) => l.trim())
    ?.trim();
  if (firstLine) return firstLine;
  return `Goal ${index + 1}`;
}

/** Short label for selects and compact lists. */
export function storedGoalListLabel(raw: string, index: number): string {
  const { title, description } = parseStoredGoal(raw);
  if (!title.trim() && !description.trim()) {
    return `Goal ${index + 1} (empty)`;
  }
  const head = storedGoalTitle(raw, index);
  const max = 56;
  return head.length > max ? `${head.slice(0, max)}…` : head;
}

export function goalHasDetails(raw: string): boolean {
  return Boolean(parseStoredGoal(raw).description.trim());
}
