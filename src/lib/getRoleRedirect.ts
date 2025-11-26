/**
 * Get the redirect URL based on user role
 * Matches the logic from src/app/page.tsx for client navigation links
 */
export function getRoleRedirect(role: string | undefined | null): string {
  // For client components (no DB/Clerk lookups). Root will perform server redirect.
  return "/";
}
