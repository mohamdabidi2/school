import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const classId = searchParams.get('classId');
  if (!classId) return new Response(JSON.stringify([]), { status: 200, headers: { "Content-Type": "application/json" } });
  const id = parseInt(classId);
  try {
    const lessons = await prisma.lesson.findMany({
      where: { classId: id },
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    });
    return new Response(JSON.stringify(lessons), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify([]), { status: 200, headers: { "Content-Type": "application/json" } });
  }
}


