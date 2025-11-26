import { auth } from "@clerk/nextjs/server";

export async function GET() {
  const { userId } = auth();
  return new Response(JSON.stringify({ id: userId || null }), { status: 200, headers: { "Content-Type": "application/json" } });
}


