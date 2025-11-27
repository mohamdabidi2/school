import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    const role = user?.role;

    const where: any = {};
    if (role === "teacher" && user) {
      where.teacherId = user.teacherId || user.id;
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


