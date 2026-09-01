/**
 * Schedule entry from admin.schedule_entries (per organization, per person).
 */
export type ScheduleEntry = {
  id: string;
  organization_id: string;
  owner_user_id: string;
  name: string;
  activity_id: string | null;
  schedule_date: string; // YYYY-MM-DD
  start_time: string; // HH:MM or HH:MM:SS
  end_time: string;
  created_at: string | null;
};

export type ScheduleRosterMember = {
  user_id: string;
  display_name: string;
  role: string | null;
  can_edit: boolean;
};
