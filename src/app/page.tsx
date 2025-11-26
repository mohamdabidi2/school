import { auth, clerkClient } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";

export default async function HomePage() {
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("🔶 [HOME PAGE] Page component executing");
  
  const { userId } = await auth();
  console.log("   ├─ userId:", userId ? `✅ ${userId}` : "❌ null");
  
  if (!userId) {
    console.log("   └─ ❌ No userId - REDIRECTING to /sign-in");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    redirect("/sign-in");
  }
  
  // Get user role and redirect
  try {
    console.log("   └─ ✅ User authenticated - Getting user role...");
    const clerk = await clerkClient();
    const clerkUser = await clerk.users.getUser(userId);
    const role = clerkUser.publicMetadata?.role as string | undefined;
    const email = clerkUser.emailAddresses?.[0]?.emailAddress;

    console.log("      ├─ Role:", role || "not set");
    console.log("      ├─ Email:", email || "not found");

    if (role && email) {
      if (role === "teacher") {
        const teacher = await prisma.teacher.findFirst({ where: { email } });
        if (teacher) {
          console.log("      └─ 🎓 Teacher found - REDIRECTING to:", `/list/teachers/${teacher.id}`);
          console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
          return redirect(`/list/teachers/${teacher.id}`);
        }
      }
      if (role === "student") {
        const student = await prisma.student.findFirst({ where: { email } });
        if (student) {
          console.log("      └─ 🎒 Student found - REDIRECTING to:", `/list/students/${student.id}`);
          console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
          return redirect(`/list/students/${student.id}`);
        }
      }
      if (role === "parent") {
        const parent = await prisma.parent.findFirst({ where: { email } });
        if (parent) {
          console.log("      └─ 👨‍👩‍👧 Parent found - REDIRECTING to:", `/list/parents/${parent.id}`);
          console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
          return redirect(`/list/parents/${parent.id}`);
        }
      }
    }

    // Default: unified dashboard for admin/director/administration/finance and fallback
    console.log("      └─ 📊 Default role - REDIRECTING to /dashboard");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    redirect("/dashboard");
  } catch (error) {
    // Fallback to dashboard if error
    console.error("      └─ ❌ ERROR:", error);
    console.log("      └─ ⚠️ Fallback: REDIRECTING to /dashboard");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    redirect("/dashboard");
  }
}
