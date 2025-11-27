import { auth, clerkClient } from "@clerk/nextjs/server";
import { getRoleRedirect } from "@/lib/getRoleRedirect";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const clerk = await clerkClient();
  const user = await clerk.users.getUser(userId);
  const role = user.publicMetadata?.role as string | undefined;
  const target = getRoleRedirect(role);

  redirect(target);
}
