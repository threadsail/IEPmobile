import type { SupabaseClient } from "@supabase/supabase-js";
import type { ScheduleEntry } from "@/types/schedule";

/** Normalize any date value from the API to YYYY-MM-DD for comparison with selectedKey. */
function toDateOnly(value: unknown): string {
  if (value == null) return "";
  if (typeof value === "string") {
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
    return value.slice(0, 10);
  }
  if (typeof value === "object" && "getFullYear" in value) {
    const d = value as Date;
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }
  return String(value).slice(0, 10);
}

/**
 * Fetches schedule entries for the current user's organization in the given date range.
 */
export async function getScheduleEntries(
  supabase: SupabaseClient,
  dateFrom: string,
  dateTo: string,
  ownerUserId?: string | null
): Promise<ScheduleEntry[]> {
  const { data, error } = await supabase.rpc("get_schedule_entries", {
    p_date_from: dateFrom,
    p_date_to: dateTo,
    p_owner_user_id: ownerUserId ?? null,
  });

  if (error) return [];
  const rows = (data ?? []) as ScheduleEntry[];
  return rows.map((r) => ({
    ...r,
    owner_user_id: r.owner_user_id != null ? String(r.owner_user_id) : "",
    schedule_date: toDateOnly(r.schedule_date),
    activity_id: r.activity_id != null && r.activity_id !== "" ? String(r.activity_id) : null,
    start_time: typeof r.start_time === "string" ? r.start_time : String(r.start_time ?? ""),
    end_time: typeof r.end_time === "string" ? r.end_time : String(r.end_time ?? ""),
  }));
}
