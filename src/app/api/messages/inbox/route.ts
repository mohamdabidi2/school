import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return new Response(JSON.stringify([]), { status: 200, headers: { "Content-Type": "application/json" } });
    const messages = await prisma.message.findMany({
      where: { recipientId: user.id },
      orderBy: { createdAt: 'desc' }
    });
    return new Response(JSON.stringify(messages), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify([]), { status: 200, headers: { "Content-Type": "application/json" } });
  }
}


