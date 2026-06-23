const PREFIX = "iep1:";

export type ParsedGoal = {
  title: string;
  goal: string;
  objectives: string[];
};

export function emptyParsedGoal(): ParsedGoal {
  return { title: "", goal: "", objectives: [""] };
}

function normalizeObjectives(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter((item): item is string => typeof item === "string").map((s) => s.trim()).filter(Boolean);
}

/** Decode a stored goal string (legacy plain text or structured). */
export function parseStoredGoal(raw: string): ParsedGoal {
  const s = typeof raw === "string" ? raw : "";
  if (s.startsWith(PREFIX)) {
    try {
      const j = JSON.parse(s.slice(PREFIX.length)) as unknown;
      if (j && typeof j === "object") {
        const o = j as { t?: unknown; g?: unknown; d?: unknown; o?: unknown };
        const goalText =
          typeof o.g === "string" ? o.g : typeof o.d === "string" ? o.d : "";
        return {
          title: typeof o.t === "string" ? o.t : "",
          goal: goalText,
          objectives: normalizeObjectives(o.o),
        };
      }
    } catch {
      /* fall through */
    }
  }
  return { title: s.trim(), goal: "", objectives: [] };
}

/** Encode for RPC / DB; empty goals return "" and are dropped by callers. */
export function serializeParsedGoal(goal: ParsedGoal): string {
  const t = goal.title.trim();
  const g = goal.goal.trim();
  const o = normalizeObjectives(goal.objectives);
  if (!t && !g && o.length === 0) return "";
  return `${PREFIX}${JSON.stringify({ t, g, o })}`;
}

/** @deprecated Use serializeParsedGoal */
export function serializeGoal(title: string, goal: string): string {
  return serializeParsedGoal({ title, goal, objectives: [] });
}

export function parsedGoalHasContent(goal: ParsedGoal): boolean {
  return Boolean(serializeParsedGoal(goal));
}

export function goalsContentEqual(a: ParsedGoal, b: ParsedGoal): boolean {
  return (
    a.title.trim() === b.title.trim() &&
    a.goal.trim() === b.goal.trim() &&
    JSON.stringify(normalizeObjectives(a.objectives)) ===
      JSON.stringify(normalizeObjectives(b.objectives))
  );
}

/** Display title for lists (full title, not truncated). */
export function storedGoalTitle(raw: string, index: number): string {
  const { title, goal } = parseStoredGoal(raw);
  if (title.trim()) return title.trim();
  const firstLine = goal
    .trim()
    .split(/\r?\n/)
    .find((l) => l.trim())
    ?.trim();
  if (firstLine) return firstLine;
  const { objectives } = parseStoredGoal(raw);
  if (objectives[0]?.trim()) return objectives[0].trim();
  return `Goal ${index + 1}`;
}

/** Short label for selects and compact lists. */
export function storedGoalListLabel(raw: string, index: number): string {
  const parsed = parseStoredGoal(raw);
  if (!parsed.title.trim() && !parsed.goal.trim() && parsed.objectives.length === 0) {
    return `Goal ${index + 1} (empty)`;
  }
  const head = storedGoalTitle(raw, index);
  const max = 56;
  return head.length > max ? `${head.slice(0, max)}…` : head;
}

export function goalHasDetails(raw: string): boolean {
  const { goal, objectives } = parseStoredGoal(raw);
  return Boolean(goal.trim() || objectives.length > 0);
}
