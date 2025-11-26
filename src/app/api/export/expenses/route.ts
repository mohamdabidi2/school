import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

function escapeCsv(value: any) {
  if (value === null || value === undefined) return '';
  const s = String(value);
  if (s.includes(',') || s.includes('\n') || s.includes('"')) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

export async function GET() {
  try {
    const expenses = await prisma.expense.findMany({ orderBy: { date: 'desc' } });

    const header = ['id', 'title', 'description', 'amount', 'status', 'date', 'createdBy']
      .map(escapeCsv)
      .join(',') + '\n';

    const rows = expenses
      .map((e) => [e.id, e.title, e.description ?? '', e.amount.toFixed(2), e.status, e.date.toISOString(), e.createdBy]
        .map(escapeCsv)
        .join(','))
      .join('\n');

    const csv = header + rows;

    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="expenses.csv"',
      },
    });
  } catch (err) {
    console.error('Failed to export expenses CSV', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
