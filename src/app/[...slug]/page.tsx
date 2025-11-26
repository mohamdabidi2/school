import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function CatchAllPage() {
  const { userId } = await auth();
  
  // If authenticated, redirect to dashboard; otherwise to sign-in
  if (userId) {
    redirect("/dashboard");
  } else {
    redirect("/sign-in");
  }
}
