import { auth, clerkClient } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";

export default async function HomePage() {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }
  
  // Get user role and redirect
  try {
    const clerk = await clerkClient();
    const clerkUser = await clerk.users.getUser(userId);
    const role = clerkUser.publicMetadata?.role as string | undefined;
    const email = clerkUser.emailAddresses?.[0]?.emailAddress;

    if (role && email) {
      if (role === "teacher") {
        const teacher = await prisma.teacher.findFirst({ where: { email } });
        if (teacher) return redirect(`/list/teachers/${teacher.id}`);
      }
      if (role === "student") {
        const student = await prisma.student.findFirst({ where: { email } });
        if (student) return redirect(`/list/students/${student.id}`);
      }
      if (role === "parent") {
        const parent = await prisma.parent.findFirst({ where: { email } });
        if (parent) return redirect(`/list/parents/${parent.id}`);
      }
    }

    // Default: unified dashboard for admin/director/administration/finance and fallback
    redirect("/dashboard");
  } catch (error) {
    // Fallback to dashboard if error
    redirect("/dashboard");
  }
}
