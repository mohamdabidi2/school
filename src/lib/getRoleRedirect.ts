/**
 * Get the redirect URL based on user role
 * Matches the logic from src/app/page.tsx for client navigation links
 */
export function getRoleRedirect(role: string | undefined | null): string {
  if (!role) return "/dashboard";

  const map: Record<string, string> = {
    admin: "/admin",
    director: "/admin",
    "school-manager": "/admin",
    teacher: "/teacher",
    student: "/student",
    parent: "/parent",
    finance: "/finance",
    administration: "/administration",
  };

  return map[role] || "/dashboard";
}
