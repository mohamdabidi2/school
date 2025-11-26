import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function GET(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return new Response(JSON.stringify([]), { status: 200, headers: { "Content-Type": "application/json" } });
    const { searchParams } = new URL(request.url);
    const peerId = searchParams.get('peerId');
    if (!peerId) return new Response(JSON.stringify([]), { status: 200, headers: { "Content-Type": "application/json" } });

    const thread = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId, recipientId: peerId },
          { senderId: peerId, recipientId: userId },
        ],
      },
      orderBy: { createdAt: 'asc' },
    });
    // include minimal avatar via user tables if present
    const students = await prisma.student.findMany({ select: { id: true, img: true, name: true, surname: true } });
    const teachers = await prisma.teacher.findMany({ select: { id: true, img: true, name: true, surname: true } });
    const parents = await prisma.parent.findMany({ select: { id: true, name: true, surname: true } });
    const imgById: Record<string, { img?: string|null; name?: string; surname?: string }> = {};
    students.forEach(s => imgById[s.id] = { img: s.img, name: s.name, surname: s.surname });
    teachers.forEach(t => imgById[t.id] = { img: t.img, name: t.name, surname: t.surname });
    parents.forEach(p => imgById[p.id] = { img: undefined, name: p.name, surname: p.surname });
    const enriched = thread.map(m => ({ ...m, sender: imgById[m.senderId] || null, recipient: imgById[m.recipientId] || null }));
    return new Response(JSON.stringify(enriched), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify([]), { status: 200, headers: { "Content-Type": "application/json" } });
  }
}


