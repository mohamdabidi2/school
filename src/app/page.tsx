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
console.log(target,"target");
console.log(role,"role"); 
console.log(user,"user");
console.log(userId,"userId");
console.log(clerk,"clerk");
console.log(user.publicMetadata,"user.publicMetadata");
console.log(user.publicMetadata?.role,"user.publicMetadata?.role");
console.log(user.publicMetadata?.teacherId,"user.publicMetadata?.teacherId");
console.log(user.publicMetadata?.studentId,"user.publicMetadata?.studentId");
console.log(user.publicMetadata?.parentId,"user.publicMetadata?.parentId");
console.log(user.publicMetadata?.role,"user.publicMetadata?.role");
console.log(user.publicMetadata?.teacherId,"user.publicMetadata?.teacherId");
console.log(user.publicMetadata?.studentId,"user.publicMetadata?.studentId");
console.log(user.publicMetadata?.parentId,"user.publicMetadata?.parentId");
  redirect(target);
}
