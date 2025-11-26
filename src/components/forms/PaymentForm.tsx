"use client";

import { useState, useEffect } from "react";
import { Student, Payment, Class, InstallmentType } from "@prisma/client";
import { createPayment, updateStudentPaymentInfo } from "@/lib/actions";

type StudentWithPayments = Student & { 
  payments: Payment[];
  class: Class;
};

interface PaymentFormData {
  studentId: string;
  amount: number;
  trancheNumber?: number;
  totalAmount?: number;
  installmentType?: InstallmentType;
  installmentCount?: number;
  firstInstallmentAmount?: number;
}

interface PaymentFormProps {
  students: StudentWithPayments[];
  onSuccess: () => void;
  onCancel: () => void;
}

export default function PaymentForm({ students, onSuccess, onCancel }: PaymentFormProps) {
  const [paymentForm, setPaymentForm] = useState<PaymentFormData>({
    studentId: "",
    amount: 0,
    trancheNumber: undefined,
    totalAmount: undefined,
    installmentType: undefined,
    installmentCount: undefined,
    firstInstallmentAmount: undefined
  });
  const [selectedStudent, setSelectedStudent] = useState<StudentWithPayments | null>(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'select-student' | 'configure-payment' | 'add-payment'>('select-student');

  // Update selected student when studentId changes
  useEffect(() => {
    if (paymentForm.studentId) {
      const student = students.find(s => s.id === paymentForm.studentId);
      setSelectedStudent(student || null);
      
      if (student?.paymentType === "tranche") {
        const nextTranche = (Math.max(0, ...student.payments.map(p => p.trancheNumber || 0)) || 0) + 1;
        setPaymentForm((form) => ({ ...form, trancheNumber: nextTranche }));
      } else {
        setPaymentForm((form) => ({ ...form, trancheNumber: undefined }));
      }
    } else {
      setSelectedStudent(null);
    }
  }, [paymentForm.studentId, students]);

  // Calculate remaining amount for installment payments
  const calculateRemainingAmount = (student: StudentWithPayments): number => {
    if (!student.totalAmount) return 0;
    const paidAmount = student.payments.reduce((sum, payment) => sum + payment.amount, 0);
    return student.totalAmount - paidAmount;
  };

  // Calculate installment amounts
  const calculateInstallmentAmounts = (totalAmount: number, installmentCount: number, firstAmount: number) => {
    const remainingAmount = totalAmount - firstAmount;
    const remainingInstallments = installmentCount - 1;
    const regularAmount = remainingInstallments > 0 ? remainingAmount / remainingInstallments : 0;
    
    return {
      firstAmount,
      regularAmount,
      remainingAmount
    };
  };

  const handlePaymentTypeChange = async (newType: 'complete' | 'tranche') => {
    if (!selectedStudent) return;
    
    try {
      await updateStudentPaymentInfo({ success: false, error: false }, {
        studentId: selectedStudent.id,
        paymentType: newType,
        totalAmount: newType === 'tranche' ? paymentForm.totalAmount : null,
        installmentType: newType === 'tranche' ? paymentForm.installmentType : null,
        installmentCount: newType === 'tranche' ? paymentForm.installmentCount : null,
        firstInstallmentAmount: newType === 'tranche' ? paymentForm.firstInstallmentAmount : null
      });
      
      // Refresh student data
      onSuccess();
    } catch (error) {
      console.error('Error updating payment type:', error);
    }
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await createPayment({ success: false, error: false }, {
        studentId: paymentForm.studentId,
        amount: paymentForm.amount,
        trancheNumber: paymentForm.trancheNumber
      });

      if (result.success) {
        onSuccess();
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

  const renderStepContent = () => {
    switch (step) {
      case 'select-student':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Sélectionner un étudiant</h3>
            <div>
              <label className="block text-sm font-medium mb-2">Étudiant</label>
              <select
                value={paymentForm.studentId}
                onChange={e => setPaymentForm((form) => ({ ...form, studentId: e.target.value }))}
                className="w-full p-2 border rounded-md"
                required
              >
                <option value="">Sélectionner un étudiant</option>
                {students.map(student => (
                  <option key={student.id} value={student.id}>
                    {student.name} {student.surname} - {student.class.name}
                  </option>
                ))}
              </select>
            </div>
            
            {selectedStudent && (
              <div className="mt-4 p-4 bg-gray-50 rounded-md">
                <h4 className="font-semibold mb-2">Informations de l&apos;étudiant</h4>
                <p><strong>Nom:</strong> {selectedStudent.name} {selectedStudent.surname}</p>
                <p><strong>Classe:</strong> {selectedStudent.class.name}</p>
                <p><strong>Type de paiement actuel:</strong> 
                  <span className={`ml-2 px-2 py-1 rounded text-xs ${
                    selectedStudent.paymentType === "complete" 
                      ? "bg-green-200 text-green-900" 
                      : "bg-blue-100 text-blue-900"
                  }`}>
                    {selectedStudent.paymentType === "complete" ? "Complet" : "Tranches"}
                  </span>
                </p>
                
                {selectedStudent.paymentType === "tranche" && (
                  <div className="mt-2">
                    <p><strong>Montant total:</strong> {selectedStudent.totalAmount?.toFixed(2) || "Non défini"} TND</p>
                    <p><strong>Montant payé:</strong> {selectedStudent.payments.reduce((s, p) => s + p.amount, 0).toFixed(2)} TND</p>
                    <p><strong>Reste à payer:</strong> {calculateRemainingAmount(selectedStudent).toFixed(2)} TND</p>
                  </div>
                )}
              </div>
            )}
            
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setStep('configure-payment')}
                disabled={!selectedStudent}
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:opacity-50"
              >
                Continuer
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
              >
                Annuler
              </button>
            </div>
          </div>
        );

      case 'configure-payment':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Configurer le type de paiement</h3>
            
            <div>
              <label className="block text-sm font-medium mb-2">Type de paiement</label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="paymentType"
                    value="complete"
                    checked={selectedStudent?.paymentType === "complete"}
                    onChange={() => handlePaymentTypeChange('complete')}
                    className="mr-2"
                  />
                  Paiement complet
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="paymentType"
                    value="tranche"
                    checked={selectedStudent?.paymentType === "tranche"}
                    onChange={() => handlePaymentTypeChange('tranche')}
                    className="mr-2"
                  />
                  Paiement par tranches
                </label>
              </div>
            </div>

            {selectedStudent?.paymentType === "tranche" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Montant total (TND)</label>
                  <input
                    type="number"
                    step="0.01"
                    min={0}
                    value={paymentForm.totalAmount || ""}
                    onChange={e => setPaymentForm({ ...paymentForm, totalAmount: parseFloat(e.target.value) })}
                    className="w-full p-2 border rounded-md"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Type d&apos;échéance</label>
                  <select
                    value={paymentForm.installmentType || ""}
                    onChange={e => setPaymentForm({ ...paymentForm, installmentType: e.target.value as InstallmentType })}
                    className="w-full p-2 border rounded-md"
                    required
                  >
                    <option value="">Sélectionner le type d&apos;échéance</option>
                    <option value="TRIMESTER">Par trimestre</option>
                    <option value="MONTHLY">Par mois</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Nombre de tranches</label>
                  <input
                    type="number"
                    min={2}
                    max={12}
                    value={paymentForm.installmentCount || ""}
                    onChange={e => setPaymentForm({ ...paymentForm, installmentCount: parseInt(e.target.value) })}
                    className="w-full p-2 border rounded-md"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Montant de la première tranche (TND)</label>
                  <input
                    type="number"
                    step="0.01"
                    min={0}
                    value={paymentForm.firstInstallmentAmount || ""}
                    onChange={e => setPaymentForm({ ...paymentForm, firstInstallmentAmount: parseFloat(e.target.value) })}
                    className="w-full p-2 border rounded-md"
                    required
                  />
                </div>

                {paymentForm.totalAmount && paymentForm.installmentCount && paymentForm.firstInstallmentAmount && (
                  <div className="p-4 bg-blue-50 rounded-md">
                    <h4 className="font-semibold mb-2">Calcul automatique des tranches:</h4>
                    {(() => {
                      const { firstAmount, regularAmount, remainingAmount } = calculateInstallmentAmounts(
                        paymentForm.totalAmount,
                        paymentForm.installmentCount,
                        paymentForm.firstInstallmentAmount
                      );
                      return (
                        <div className="space-y-1 text-sm">
                          <p><strong>1ère tranche:</strong> {firstAmount.toFixed(2)} TND</p>
                          <p><strong>Tranches suivantes:</strong> {regularAmount.toFixed(2)} TND chacune</p>
                          <p><strong>Montant restant après 1ère tranche:</strong> {remainingAmount.toFixed(2)} TND</p>
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setStep('add-payment')}
                disabled={!selectedStudent || (selectedStudent.paymentType === "tranche" && (!paymentForm.totalAmount || !paymentForm.installmentType || !paymentForm.installmentCount || !paymentForm.firstInstallmentAmount))}
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:opacity-50"
              >
                Continuer
              </button>
              <button
                type="button"
                onClick={() => setStep('select-student')}
                className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
              >
                Retour
              </button>
            </div>
          </div>
        );

      case 'add-payment':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Ajouter un paiement</h3>
            
            <form onSubmit={handlePaymentSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  Montant (TND){selectedStudent?.paymentType === "tranche" && " de cette tranche"}
                </label>
                <input
                  type="number"
                  step="0.01"
                  min={0}
                  value={paymentForm.amount}
                  onChange={e => setPaymentForm({ ...paymentForm, amount: parseFloat(e.target.value) })}
                  className="w-full p-2 border rounded-md"
                  required
                />
              </div>

              {selectedStudent?.paymentType === "tranche" && (
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Numéro de tranche</label>
                  <input
                    type="number"
                    min={1}
                    value={paymentForm.trancheNumber || ""}
                    readOnly
                    className="w-full p-2 border rounded-md bg-gray-100"
                  />
                </div>
              )}

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:opacity-50"
                >
                  {loading ? "Ajout..." : "Ajouter le paiement"}
                </button>
                <button
                  type="button"
                  onClick={() => setStep('configure-payment')}
                  className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
                >
                  Retour
                </button>
              </div>
            </form>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-[600px] max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-semibold mb-4">Gestion des Paiements</h2>
        {renderStepContent()}
      </div>
    </div>
  );
}
