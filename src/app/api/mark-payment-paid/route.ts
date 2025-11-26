import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { paymentId } = await request.json();
    if (!paymentId) return NextResponse.json({ error: 'paymentId requis' }, { status: 400 });

    const updated = await prisma.payment.update({
      where: { id: paymentId },
      data: { paid: true, date: new Date(), isOverdue: false },
    });

    return NextResponse.json(updated);
  } catch (e) {
    console.error('Erreur mark-payment-paid:', e);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}


