export const ROLES = [
  "Priest",
  "Executive Admin",
  "Admin",
  "Employee",
  "Sacristan",
  "Parent of Altar Server",
  "Suspended Account",
] as const;

export type Role = typeof ROLES[number];

export const PERMISSIONS: Record<Role, string[]> = {
  Priest: ["manage_users", "view_reports", "assign_roles", "delete_content"],
  "Executive Admin": ["manage_users", "view_reports", "assign_roles"],
  Admin: ["manage_users", "view_reports"],
  Employee: ["view_reports"],
  Sacristan: ["view_tasks"],
  "Parent of Altar Server": ["view_announcements"],
  "Suspended Account": [],
};
