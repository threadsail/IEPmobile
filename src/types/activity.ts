/**
 * Shape for activity rows from public.activities.
 */
export type Activity = {
  id: string;
  name: string;
  /** Optional short description or category */
  description: string | null;
  /** Optional icon name or emoji for the card */
  icon: string | null;
  /** Optional color key for styling (e.g. "purple", "teal") */
  color: string | null;
  /** "create" | "youtube" */
  activity_type: string;
  /** Set when activity_type is "youtube" */
  youtube_url: string | null;
  /** For sort by popularity */
  usage_count: number | null;
  created_at: string | null;
  updated_at: string | null;
};
