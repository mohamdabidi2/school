"use client";

import { useState, useEffect } from "react";
import { Payment, Student, Class } from "@prisma/client";
import { getOverduePayments } from "@/lib/actions";

type OverduePayment = Payment & {
  student: Student & {
    class: Class;
  };
};

export default function OverduePaymentsAlert() {
  const [overduePayments, setOverduePayments] = useState<OverduePayment[]>([]);
  const [showAlert, setShowAlert] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOverduePayments = async () => {
      try {
        const payments = await getOverduePayments();
        setOverduePayments(payments);
        setShowAlert(payments.length > 0);
      } catch (error) {
        console.error('Error fetching overdue payments:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOverduePayments();
    
    // Check for overdue payments every 5 minutes
    const interval = setInterval(fetchOverduePayments, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  const formatDate = (date: string | Date) => {
    const d = typeof date === "string" ? new Date(date) : date;
    if (isNaN(d.getTime())) return "";
    return d.toLocaleDateString('fr-FR');
  };

  const getDaysOverdue = (dueDate: string | Date) => {
    const due = typeof dueDate === "string" ? new Date(dueDate) : dueDate;
    const now = new Date();
    const diffTime = now.getTime() - due.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  if (loading) {
    return null;
  }

  if (!showAlert || overduePayments.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md">
      <div className="bg-red-50 border border-red-200 rounded-lg shadow-lg">
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Paiements en Retard ({overduePayments.length})
                </h3>
              </div>
            </div>
            <button
              onClick={() => setShowAlert(false)}
              className="text-red-400 hover:text-red-600"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {overduePayments.map((payment) => (
              <div key={payment.id} className="bg-white p-3 rounded border border-red-200">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {payment.student.name} {payment.student.surname}
                    </p>
                    <p className="text-xs text-gray-600">
                      {payment.student.class.name} - Tranche #{payment.trancheNumber}
                    </p>
                    <p className="text-xs text-gray-600">
                      Montant: {payment.amount.toFixed(2)} TND
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-red-600 font-medium">
                      {getDaysOverdue(payment.dueDate!)} jour{getDaysOverdue(payment.dueDate!) > 1 ? 's' : ''} de retard
                    </p>
                    <p className="text-xs text-gray-500">
                      Échéance: {formatDate(payment.dueDate!)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-3 pt-3 border-t border-red-200">
            <p className="text-xs text-red-700">
              <strong>Action requise:</strong> Contactez les familles concernées pour régulariser les paiements.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
