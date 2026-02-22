/**
 * Shape for activity rows from a future Supabase table (e.g. public.activities).
 * Add or change columns here when you create the table.
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
  /** For sort by popularity; null until the DB has it */
  usage_count: number | null;
  created_at: string | null;
  updated_at: string | null;
};
