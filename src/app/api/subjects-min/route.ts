import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const subjects = await prisma.subject.findMany({
      select: { id: true, name: true, teachers: { select: { id: true, name: true, surname: true } } },
    });
    return new Response(JSON.stringify(subjects), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify([]), { status: 200, headers: { "Content-Type": "application/json" } });
  }
}



