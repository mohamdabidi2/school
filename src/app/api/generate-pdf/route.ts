import { NextRequest, NextResponse } from 'next/server';
import PDFDocument from 'pdfkit';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { studentId, paymentId } = await request.json();

    // Récupérer les données de l'étudiant et du paiement
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        payments: true,
        class: true
      }
    });

    if (!student) {
      return NextResponse.json({ error: 'Étudiant non trouvé' }, { status: 404 });
    }

    const payment = student.payments.find(p => p.id === paymentId);
    if (!payment) {
      return NextResponse.json({ error: 'Paiement non trouvé' }, { status: 404 });
    }

    // Générer le PDF
    const pdfBytes = await generatePaymentPDF(student, payment);
    // Copy into a new ArrayBuffer to ensure it's a valid BlobPart
    const bufferCopy = pdfBytes.slice().buffer;
    const pdfBlob = new Blob([bufferCopy], { type: 'application/pdf' });

    return new NextResponse(pdfBlob, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="paiement_${student.name}_${student.surname}_${payment.id}.pdf"`
      }
    });
  } catch (error) {
    console.error('Erreur lors de la génération du PDF:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

async function generatePaymentPDF(
  student: any,
  payment: any
): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 50
      });

      const chunks: Uint8Array[] = [];
      doc.on('data', (chunk: any) => {
        chunks.push(new Uint8Array(chunk));
      });
      doc.on('end', () => {
        const pdfData = concatUint8Arrays(chunks);
        resolve(pdfData);
      });

      // En-tête avec logo fictif
      doc.fontSize(20)
         .fillColor('#2563eb')
         .text('ÉCOLE EXCELLENCE', 50, 50, { align: 'center' });
      
      doc.fontSize(12)
         .fillColor('#6b7280')
         .text('Reçu de Paiement', 50, 80, { align: 'center' });

      // Ligne de séparation
      doc.moveTo(50, 100)
         .lineTo(550, 100)
         .stroke('#e5e7eb');

      // Informations de l'élève
      doc.fontSize(14)
         .fillColor('#1f2937')
         .text('Informations de l\'élève:', 50, 120);

      doc.fontSize(12)
         .fillColor('#374151')
         .text(`Nom: ${student.name} ${student.surname}`, 50, 150)
         .text(`Classe: ${student.class?.name || 'N/A'}`, 50, 170)
         .text(`Type de paiement: ${student.paymentType === 'complete' ? 'Paiement complet' : 'Paiement par tranches'}`, 50, 190);

      // Informations du paiement
      doc.fontSize(14)
         .fillColor('#1f2937')
         .text('Détails du paiement:', 50, 230);

      doc.fontSize(12)
         .fillColor('#374151')
         .text(`Montant payé: ${payment.amount.toFixed(2)} TND`, 50, 260)
         .text(`Date du paiement: ${new Date(payment.date).toLocaleDateString('fr-FR')}`, 50, 280);

      if (payment.trancheNumber) {
        doc.text(`Numéro de tranche: ${payment.trancheNumber}`, 50, 300);
      }

      // Total des paiements si paiement par tranches
      if (student.paymentType === 'tranche') {
        const totalPaid = student.payments.reduce((sum: number, p: any) => sum + p.amount, 0);
        doc.text(`Total payé à ce jour: ${totalPaid.toFixed(2)} TND`, 50, 320);
      }

      // Ligne de séparation
      doc.moveTo(50, 360)
         .lineTo(550, 360)
         .stroke('#e5e7eb');

      // Signature
      doc.fontSize(12)
         .fillColor('#374151')
         .text('Signature de l\'administration:', 50, 380);

      doc.moveTo(50, 420)
         .lineTo(200, 420)
         .stroke('#374151');

      doc.fontSize(10)
         .fillColor('#6b7280')
         .text('Administration', 50, 430);

      // Pied de page
      doc.fontSize(8)
         .fillColor('#9ca3af')
         .text('Ce reçu est généré automatiquement par le système de gestion scolaire', 50, 500, { align: 'center' });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

function concatUint8Arrays(chunks: Uint8Array[]): Uint8Array {
  const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }
  return result;
}
