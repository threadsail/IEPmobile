/**
 * Shape for student rows (e.g. public.students).
 * Add columns in Supabase and here when you extend the schema.
 */
export type Student = {
  id: string;
  user_id: string;
  name: string;
  /** Optional note or grade level */
  note: string | null;
  created_at: string | null;
  updated_at: string | null;
};
