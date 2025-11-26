import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';

// This route depends on auth/session and must be treated as dynamic
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { userId, sessionClaims } = await auth();
    const role = (sessionClaims?.metadata as { role?: string })?.role || '';

    const where: any = {};
    if (role === 'student' && userId) {
      where.id = userId;
    } else if (role === 'parent' && userId) {
      where.parentId = userId;
    } else if (role === 'teacher' && userId) {
      where.class = { lessons: { some: { teacherId: userId } } };
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
