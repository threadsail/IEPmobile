/** Roles with full org management rights (schedules, invites, billing, etc.). */
export const STAFF_ROLES = ["Teacher", "Admin"] as const;

export type StaffRole = (typeof STAFF_ROLES)[number];

export function isStaffRole(role: string | null | undefined): role is StaffRole {
  return role === "Teacher" || role === "Admin";
}

/** User-facing labels. Admin is a school administrator, not a super-admin. */
export const ROLE_LABELS: Record<string, string> = {
  Teacher: "Teacher",
  Admin: "School administrator",
  Aide: "Aide",
};

export function roleLabel(role: string | null | undefined): string {
  if (!role) return "Not set";
  return ROLE_LABELS[role] ?? role;
}
