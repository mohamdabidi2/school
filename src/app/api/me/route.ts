import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  return new Response(JSON.stringify({ id: user?.id || null, role: user?.role || null }), { status: 200, headers: { "Content-Type": "application/json" } });
}


