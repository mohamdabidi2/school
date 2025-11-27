import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { "Content-Type": "application/json" } });
  }
  const role = user.role;

  if (role === 'student') {
    const studentId = user.studentId || user.id;
    // Student: can message only their teachers (by class and lessons)
    const student = await prisma.student.findUnique({ where: { id: studentId }, select: { classId: true } });
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


