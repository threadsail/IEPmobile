/**
 * Schedule entry from admin.schedule_entries (per organization).
 */
export type ScheduleEntry = {
  id: string;
  organization_id: string;
  name: string;
  activity_id: string | null;
  schedule_date: string; // YYYY-MM-DD
  start_time: string; // HH:MM or HH:MM:SS
  end_time: string;
  created_at: string | null;
};
