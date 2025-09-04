import { hasPermission } from "./auth";
import { useCurrentRole } from "./clerk-init";
import { showSection, hideSection, setText } from "./ui";

export function ChurchApp() {
  const role = useCurrentRole();

  setText("roleDisplay", role);

  if (hasPermission(role, "manage_users")) showSection("usersSection");
  if (hasPermission(role, "view_reports")) showSection("reportsSection");
  if (hasPermission(role, "view_tasks")) showSection("tasksSection");
  if (hasPermission(role, "view_announcements")) showSection("announcementsSection");
}
