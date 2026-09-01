import type { SupabaseClient } from "@supabase/supabase-js";
import type { ScheduleRosterMember } from "@/types/schedule";

function rosterDisplayName(row: Record<string, unknown>): string {
  const name = row.display_name;
  return typeof name === "string" && name.trim() ? name.trim() : "User";
}

/**
 * Org members whose schedules the current user can view, with per-person edit permission.
 */
export async function getScheduleRoster(
  supabase: SupabaseClient
): Promise<ScheduleRosterMember[]> {
  const { data, error } = await supabase.rpc("get_schedule_roster");
  if (error) return [];

  const rows = Array.isArray(data) ? (data as Record<string, unknown>[]) : [];
  const roster: ScheduleRosterMember[] = [];

  for (const row of rows) {
    const user_id = String(row.user_id ?? "");
    if (!user_id || roster.some((m) => m.user_id === user_id)) continue;
    roster.push({
      user_id,
      display_name: rosterDisplayName(row),
      role: row.role == null ? null : String(row.role),
      can_edit: Boolean(row.can_edit),
    });
  }

  return roster;
}
