import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function GET() {
  const { userId, sessionClaims } = auth();
  const role = (sessionClaims?.metadata as { role?: string } | undefined)?.role;

  if (role === 'student' && userId) {
    // Student: can message only their teachers (by class and lessons)
    const student = await prisma.student.findUnique({ where: { id: userId }, select: { classId: true } });
    if (!student?.classId) return new Response(JSON.stringify([]), { status: 200, headers: { "Content-Type": "application/json" } });
    const teachersByClass = await prisma.class.findUnique({ where: { id: student.classId }, include: { lessons: { select: { teacherId: true, teacher: { select: { id: true, name: true, surname: true } } } } } });
    const uniq: Record<string, { id: string; label: string; role: string }> = {};
    teachersByClass?.lessons.forEach(l => { if (l.teacher) uniq[l.teacher.id] = { id: l.teacher.id, label: `${l.teacher.name} ${l.teacher.surname}`, role: 'teacher' }; });
    return new Response(JSON.stringify(Object.values(uniq)), { status: 200, headers: { "Content-Type": "application/json" } });
  }

  // Default: list all teachers (admins/teachers/parents can choose anyone)
  const teachers = await prisma.teacher.findMany({ select: { id: true, name: true, surname: true } });
  const users = teachers.map(t => ({ id: t.id, label: `${t.name} ${t.surname}`, role: 'teacher' }));
  return new Response(JSON.stringify(users), { status: 200, headers: { "Content-Type": "application/json" } });
}


