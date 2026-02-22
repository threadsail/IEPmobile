/**
 * Shape for student data applied by aides, pending teacher approval.
 * Wire to your Supabase table (e.g. applied_student_data or student_data_submissions).
 */
export type AppliedStudentData = {
  id: string;
  student_id: string;
  student_name: string | null;
  aide_id: string;
  aide_name: string | null;
  summary: string | null;
  applied_at: string;
  /** e.g. "pending", "approved", "rejected" */
  status: string;
};
