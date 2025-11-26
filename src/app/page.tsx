import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

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
  
  // All authenticated users go to dashboard - dashboard handles role-based content
  console.log("   └─ ✅ User authenticated - REDIRECTING to /dashboard");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  redirect("/dashboard");
}
