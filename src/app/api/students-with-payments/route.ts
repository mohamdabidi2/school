import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

// This route depends on auth/session and must be treated as dynamic
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const role = user.role || '';

    const where: any = {};
    if (role === 'student') {
      where.id = user.studentId || user.id;
    } else if (role === 'parent') {
      where.parentId = user.parentId || user.id;
    } else if (role === 'teacher') {
      where.class = { lessons: { some: { teacherId: user.teacherId || user.id } } };
    }

    const students = await prisma.student.findMany({
      where,
      include: {
        payments: {
          orderBy: { date: 'desc' }
        },
        class: true
      },
      orderBy: { name: 'asc' }
    });

    return NextResponse.json(students);
  } catch (error) {
    console.error('Erreur lors de la récupération des étudiants:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
