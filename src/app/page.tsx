import { auth, clerkClient } from "@clerk/nextjs/server";
import { getRoleRedirect } from "@/lib/getRoleRedirect";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const { userId } = await auth();

  if (!userId) {
    console.log("[Home] No user - redirecting to /sign-in");
    redirect("/sign-in");
  }

  const clerk = await clerkClient();
  const user = await clerk.users.getUser(userId);
  const role = user.publicMetadata?.role as string | undefined;
  const target = getRoleRedirect(role);
  console.log("[Home] User resolved", {
    userId,
    role,
    target,
  });

  redirect(target);
}
