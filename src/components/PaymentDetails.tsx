"use client";

import { useState, useEffect } from "react";
import { Student, Payment, Class, InstallmentType } from "@prisma/client";
import { createPayment } from "@/lib/actions";
import Image from "next/image";

type StudentWithPayments = Student & { 
  payments: Payment[];
  class: Class;
};

interface PaymentDetailsProps {
  student: StudentWithPayments;
  onClose: () => void;
  onPaymentAdded: () => void;
}

export default function PaymentDetails({ student, onClose, onPaymentAdded }: PaymentDetailsProps) {
  const [showAddPaymentForm, setShowAddPaymentForm] = useState(false);
  const [newPaymentAmount, setNewPaymentAmount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Calculate payment statistics
  const totalAmount = student.totalAmount || 0;
  const paidAmount = student.payments.reduce((sum, payment) => sum + payment.amount, 0);
  const remainingAmount = totalAmount - paidAmount;
  const nextTrancheNumber = student.paymentType === "tranche" 
    ? (Math.max(0, ...student.payments.map(p => p.trancheNumber || 0)) || 0) + 1
    : null;

  const addMonths = (date: Date, months: number) => {
    const d = new Date(date);
    d.setMonth(d.getMonth() + months);
    return d;
  };

  const getNextDueDate = (): Date | null => {
    if (student.paymentType !== "tranche" || !student.installmentType) return null;
    const lastPayment = [...student.payments]
      .filter(p => p.trancheNumber != null)
      .sort((a, b) => (b.trancheNumber || 0) - (a.trancheNumber || 0))[0];

    const base = lastPayment?.dueDate ? new Date(lastPayment.dueDate) : new Date();
    if (student.installmentType === 'MONTHLY') return addMonths(base, 1);
    if (student.installmentType === 'TRIMESTER') return addMonths(base, 3);
    return null;
  };

  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await createPayment(
        { success: false, error: false },
        {
          studentId: student.id,
          amount: newPaymentAmount,
          trancheNumber:
            student.paymentType === "tranche" && nextTrancheNumber != null
              ? nextTrancheNumber
              : undefined,
        }
      );

      if (result.success) {
        onPaymentAdded();
        setShowAddPaymentForm(false);
        setNewPaymentAmount(0);
        alert('Paiement ajouté avec succès!');
      } else {
        alert(result.message || "Erreur lors de l'ajout du paiement");
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de l\'ajout du paiement');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: string | Date) => {
    const d = typeof date === "string" ? new Date(date) : date;
    if (isNaN(d.getTime())) return "";
    return d.toLocaleDateString('fr-FR');
  };

  const getPaymentStatus = (payment: Payment) => {
    if (payment.paid) {
      return { status: "Payé", color: "text-green-600 bg-green-100" };
    }
    if (payment.dueDate && new Date(payment.dueDate) < new Date()) {
      return { status: "En retard", color: "text-red-600 bg-red-100" };
    }
    return { status: "Reste à Payer", color: "text-yellow-600 bg-yellow-100" };
  };

  const markAsPaid = async (payment: Payment) => {
    try {
      // For scheduled tranche (unpaid), when marked as paid we set paid = true and date = now
      const res = await fetch('/api/mark-payment-paid', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentId: payment.id })
      });
      if (!res.ok) throw new Error('Erreur de mise à jour du paiement');
      onPaymentAdded();

      // Generate local PDF
      const response = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId: student.id, paymentId: payment.id })
      });
      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `paiement_${student.name}_${student.surname}_${payment.id}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (e) {
      console.error(e);
      alert('Erreur lors de la validation du paiement');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-[800px] max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Détails des Paiements</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Student Information */}
        <div className="mb-6 p-4 bg-gray-50 rounded-md">
          <div className="flex items-center gap-4">
            <Image
              src={student.img || "/noAvatar.png"}
              alt=""
              width={60}
              height={60}
              className="w-15 h-15 rounded-full object-cover"
            />
            <div>
              <h3 className="text-lg font-semibold">{student.name} {student.surname}</h3>
              <p className="text-gray-600">Classe: {student.class.name}</p>
              <p className="text-gray-600">
                Type de paiement: 
                <span className={`ml-2 px-2 py-1 rounded text-xs ${
                  student.paymentType === "complete" 
                    ? "bg-green-200 text-green-900" 
                    : "bg-blue-100 text-blue-900"
                }`}>
                  {student.paymentType === "complete" ? "Complet" : "Par tranches"}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Payment Summary */}
        {student.paymentType === "tranche" && (
          <div className="mb-6 grid grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-md text-center">
              <h4 className="font-semibold text-blue-800">Montant Total</h4>
              <p className="text-xl font-bold text-blue-900">{totalAmount.toFixed(2)} TND</p>
            </div>
            <div className="p-4 bg-green-50 rounded-md text-center">
              <h4 className="font-semibold text-green-800">Montant Payé</h4>
              <p className="text-xl font-bold text-green-900">{paidAmount.toFixed(2)} TND</p>
            </div>
            <div className="p-4 bg-orange-50 rounded-md text-center">
              <h4 className="font-semibold text-orange-800">Reste à Payer</h4>
              <p className="text-xl font-bold text-orange-900">{remainingAmount.toFixed(2)} TND</p>
            </div>
          </div>
        )}

        {/* Installment Information */}
        {student.paymentType === "tranche" && student.installmentType && (
          <div className="mb-6 p-4 bg-gray-50 rounded-md">
            <h4 className="font-semibold mb-2">Informations sur les Tranches</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Type d&apos;échéance:</span> 
                <span className="ml-2">{student.installmentType === 'MONTHLY' ? 'Mensuel' : 'Trimestriel'}</span>
              </div>
              <div>
                <span className="font-medium">Nombre de tranches:</span> 
                <span className="ml-2">{student.installmentCount ?? '-'}</span>
              </div>
              <div>
                <span className="font-medium">Première tranche:</span> 
                <span className="ml-2">{student.firstInstallmentAmount?.toFixed(2)} TND</span>
              </div>
              <div>
                <span className="font-medium">Prochaine échéance:</span> 
                <span className="ml-2">{(() => { const d = getNextDueDate(); return d ? d.toLocaleDateString('fr-FR') : '-'; })()}</span>
              </div>
            </div>
          </div>
        )}

        {/* Payment History */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold">Historique des Paiements</h4>
            {student.paymentType === "tranche" && remainingAmount > 0 && (
              <button
                onClick={() => setShowAddPaymentForm(true)}
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
              >
                Ajouter un Paiement
              </button>
            )}
          </div>

          {student.payments.length === 0 ? (
            <p className="text-gray-500 text-center py-4">Aucun paiement enregistré</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-200">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="p-3 border-b text-left">Date</th>
                    <th className="p-3 border-b text-left">Montant</th>
                    {student.paymentType === "tranche" && <th className="p-3 border-b text-left">Tranche</th>}
                    <th className="p-3 border-b text-left">Échéance</th>
                    <th className="p-3 border-b text-left">Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {student.payments
                    .slice()
                    .sort((a, b) => {
                      // Sort unpaid scheduled by academic month Sep(8)->May(4); otherwise by date
                      const monthOrder = (d?: Date | string | null) => {
                        if (!d) return 99;
                        const x = typeof d === 'string' ? new Date(d) : d;
                        const m = x.getMonth();
                        const orderMap = [
                          /*Jan*/4, /*Feb*/5, /*Mar*/6, /*Apr*/7, /*May*/8,
                          /*Jun*/99, /*Jul*/99, /*Aug*/99, /*Sep*/0, /*Oct*/1, /*Nov*/2, /*Dec*/3
                        ];
                        return orderMap[m] ?? 99;
                      };
                      const aKey = a.paid ? 98 : monthOrder(a.dueDate || a.date);
                      const bKey = b.paid ? 98 : monthOrder(b.dueDate || b.date);
                      if (aKey !== bKey) return aKey - bKey;
                      return new Date(a.date).getTime() - new Date(b.date).getTime();
                    })
                    .map(payment => {
                    const paymentStatus = getPaymentStatus(payment);
                    return (
                      <tr key={payment.id} className="border-b hover:bg-gray-50">
                        <td className="p-3">{formatDate(payment.date)}</td>
                        <td className="p-3 font-semibold">{payment.amount.toFixed(2)} TND</td>
                        {student.paymentType === "tranche" && (
                          <td className="p-3">#{payment.trancheNumber}</td>
                        )}
                        <td className="p-3">
                          {payment.dueDate ? formatDate(payment.dueDate) : "-"}
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded text-xs ${paymentStatus.color}`}>
                            {paymentStatus.status}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          {!payment.paid && (
                            <button
                              onClick={() => markAsPaid(payment)}
                              className="bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600"
                            >
                              Marquer payé + PDF
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Add Payment Form */}
        {showAddPaymentForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
            <div className="bg-white p-6 rounded-lg w-[400px]">
              <h3 className="text-lg font-semibold mb-4">Ajouter un Paiement</h3>
              <form onSubmit={handleAddPayment}>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">
                    Montant de la tranche #{nextTrancheNumber} (TND)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min={0}
                    max={remainingAmount}
                    value={newPaymentAmount}
                    onChange={e => setNewPaymentAmount(parseFloat(e.target.value))}
                    className="w-full p-2 border rounded-md"
                    required
                  />
                  <p className="text-sm text-gray-600 mt-1">
                    Reste à payer: {remainingAmount.toFixed(2)} TND
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:opacity-50"
                  >
                    {loading ? "Ajout..." : "Ajouter"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddPaymentForm(false)}
                    className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
                  >
                    Annuler
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
