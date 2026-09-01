export type StudentProgressLog = {
  id: string;
  student_id: string;
  logged_on: string;
  goal_index: number | null;
  objective_index: number | null;
  summary: string;
  created_at: string;
};
