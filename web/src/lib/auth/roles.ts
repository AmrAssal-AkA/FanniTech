export const Roles = {
  ADMIN: "ADMIN",
  TECHNICIAN: "TECHNICIAN",
} as const;

export type Role = typeof Roles[keyof typeof Roles];

export const isAdmin = (role?: string | null): boolean => role === Roles.ADMIN;
export const isTechnician = (role?: string | null): boolean => role === Roles.TECHNICIAN;

export const hasRole = (role: string | null, allowedRoles: string[]): boolean => {
  if (!role) return false;
  return allowedRoles.includes(role);
};

export const isAuthorized = (role: string | null, allowedRoles?: string[]): boolean => {
  if (!allowedRoles || allowedRoles.length === 0) return true;
  return hasRole(role, allowedRoles);
};
