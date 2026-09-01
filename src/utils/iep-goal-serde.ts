const PREFIX = "iep1:";

export type ParsedGoal = {
  title: string;
  objectives: string[];
};

export function emptyParsedGoal(): ParsedGoal {
  return { title: "", objectives: [""] };
}

function normalizeObjectives(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((item): item is string => typeof item === "string")
    .map((s) => s.trim())
    .filter(Boolean);
}

function mergeLegacyDescription(goalText: string, objectives: string[]): string[] {
  const normalized = normalizeObjectives(objectives);
  const description = goalText.trim();
  if (!description) return normalized;
  if (normalized.length > 0) return normalized;
  return [description];
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
          objectives: mergeLegacyDescription(goalText, normalizeObjectives(o.o)),
        };
      }
    } catch {
      /* fall through */
    }
  }
  return { title: s.trim(), objectives: [] };
}

/** Encode for RPC / DB; empty goals return "" and are dropped by callers. */
export function serializeParsedGoal(goal: ParsedGoal): string {
  const t = goal.title.trim();
  const o = normalizeObjectives(goal.objectives);
  if (!t && o.length === 0) return "";
  return `${PREFIX}${JSON.stringify({ t, o })}`;
}

/** @deprecated Use serializeParsedGoal */
export function serializeGoal(title: string, _goal?: string): string {
  return serializeParsedGoal({ title, objectives: [] });
}

export function parsedGoalHasContent(goal: ParsedGoal): boolean {
  return Boolean(serializeParsedGoal(goal));
}

export function goalsContentEqual(a: ParsedGoal, b: ParsedGoal): boolean {
  return (
    a.title.trim() === b.title.trim() &&
    JSON.stringify(normalizeObjectives(a.objectives)) ===
      JSON.stringify(normalizeObjectives(b.objectives))
  );
}

/** Heading for lists and collapsed rows — title field only. */
export function storedGoalTitle(raw: string, index: number): string {
  const title = parseStoredGoal(raw).title.trim();
  if (title) return title;
  return `Goal ${index + 1}`;
}

/** Short label for selects and compact lists. */
export function storedGoalListLabel(raw: string, index: number): string {
  const parsed = parseStoredGoal(raw);
  if (!parsed.title.trim() && parsed.objectives.length === 0) {
    return `Goal ${index + 1} (empty)`;
  }
  const head = storedGoalTitle(raw, index);
  const max = 56;
  return head.length > max ? `${head.slice(0, max)}…` : head;
}

export function goalHasDetails(raw: string): boolean {
  return storedGoalObjectives(raw).length > 0;
}

/** Non-empty objectives/benchmarks for a stored goal. */
export function storedGoalObjectives(raw: string): string[] {
  return normalizeObjectives(parseStoredGoal(raw).objectives);
}

export function storedObjectiveLabel(
  raw: string,
  objectiveIndex: number,
  maxLength = 72
): string {
  const objectives = storedGoalObjectives(raw);
  const text = objectives[objectiveIndex]?.trim();
  if (!text) return `Benchmark ${objectiveIndex + 1}`;
  return text.length > maxLength ? `${text.slice(0, maxLength)}…` : text;
}
