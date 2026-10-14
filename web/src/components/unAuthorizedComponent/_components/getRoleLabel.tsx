

export function getRoleLabel(role: string | null) {
  if (!role) return "authenticated staff member";
  return role.toLowerCase() === "admin" ? "administrator" : "technician";
}