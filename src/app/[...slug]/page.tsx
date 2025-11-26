import { redirect } from "next/navigation";

export default async function CatchAllPage() {
  // Redirect any incorrect route to login
  redirect("/sign-in");
}
