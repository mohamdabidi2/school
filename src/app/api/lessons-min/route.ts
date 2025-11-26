import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function GET() {
  try {
    const { userId, sessionClaims } = await auth();
    const role = (sessionClaims?.metadata as { role?: string } | undefined)?.role;

    const where: any = {};
    if (role === "teacher" && userId) {
      where.teacherId = userId;
    }

    const lessons = await prisma.lesson.findMany({
      where,
      select: { id: true, name: true },
      orderBy: { id: "asc" },
    });

    return new Response(JSON.stringify(lessons), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify([]), { status: 200, headers: { "Content-Type": "application/json" } });
  }
}


