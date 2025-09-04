import { PERMISSIONS, Role } from "./roles";

export function hasPermission(role: Role, permission: string) {
  return PERMISSIONS[role]?.includes(permission);
}
