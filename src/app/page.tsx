import { getRoleRedirect } from "@/lib/getRoleRedirect";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

export default async function HomePage() {
  const user = await getCurrentUser();
  if (!user) {
    console.log("[Home] No user - redirecting to /sign-in");
    redirect("/sign-in");
  }

  const target = getRoleRedirect(user.role);
  console.log("[Home] User resolved", {
    userId: user.id,
    role: user.role,
    target,
  });

  redirect(target);
}
