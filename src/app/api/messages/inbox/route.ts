import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return new Response(JSON.stringify([]), { status: 200, headers: { "Content-Type": "application/json" } });
    const messages = await prisma.message.findMany({
      where: { recipientId: userId },
      orderBy: { createdAt: 'desc' }
    });
    return new Response(JSON.stringify(messages), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify([]), { status: 200, headers: { "Content-Type": "application/json" } });
  }
}


