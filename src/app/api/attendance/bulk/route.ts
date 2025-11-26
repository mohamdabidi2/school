import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { date, lessonId, absentStudentIds } = body as { date: string; lessonId: number; absentStudentIds: string[] };
    const d = new Date(date);
    if (!absentStudentIds || absentStudentIds.length === 0) return new Response(JSON.stringify({ ok: true }), { status: 200 });

    await prisma.$transaction(
      absentStudentIds.map((sid) =>
        prisma.attendance.create({ data: { date: d, present: false, studentId: sid, lessonId } })
      )
    );

    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false }), { status: 500 });
  }
}


