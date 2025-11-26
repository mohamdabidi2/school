import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

function escapeCsv(value: any) {
  if (value === null || value === undefined) return '';
  const s = String(value);
  // Escape double quotes by doubling them and wrap field in quotes if it contains comma/newline/quote
  if (s.includes(',') || s.includes('\n') || s.includes('"')) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

export async function GET() {
  try {
    const students = await prisma.student.findMany({
      include: {
        payments: { orderBy: { date: 'desc' } },
        class: true,
      },
      orderBy: { name: 'asc' },
    });

    const header = [
      'studentId',
      'name',
      'surname',
      'class',
      'paymentType',
      'totalAmount',
      'paidAmount',
      'remaining',
      'payments_detail',
    ]
      .map(escapeCsv)
      .join(',') + '\n';

    const rows = students
      .map((s) => {
        const total = s.totalAmount ?? '';
        const paid = s.payments.reduce((a, p) => a + (p.amount || 0), 0);
        const remaining = total !== '' && total !== null ? (Number(total) - paid).toFixed(2) : '';
        const paymentsStr = s.payments
          .map((p) => {
            const date = p.date ? new Date(p.date).toISOString().split('T')[0] : '';
            return `${date}:${p.amount ?? ''}:${p.trancheNumber ?? ''}:${p.paid ? 'PAID' : 'UNPAID'}`;
          })
          .join('; ');

        return [
          s.id,
          s.name,
          s.surname,
          s.class?.name ?? '',
          s.paymentType ?? '',
          total !== '' ? Number(total).toFixed(2) : '',
          paid.toFixed(2),
          remaining,
          paymentsStr,
        ]
          .map(escapeCsv)
          .join(',');
      })
      .join('\n');

    const csv = header + rows;

    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="students_payments.csv"',
      },
    });
  } catch (err) {
    console.error('Failed to export payments CSV', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
