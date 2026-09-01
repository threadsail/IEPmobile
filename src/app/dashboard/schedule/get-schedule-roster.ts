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

  return (data ?? []).reduce<ScheduleRosterMember[]>((acc, row) => {
    const r = row as Record<string, unknown>;
    const user_id = String(r.user_id ?? "");
    if (!user_id || acc.some((m) => m.user_id === user_id)) return acc;
    acc.push({
      user_id,
      display_name: rosterDisplayName(r),
      role: r.role == null ? null : String(r.role),
      can_edit: Boolean(r.can_edit),
    });
    return acc;
  }, []);
}
