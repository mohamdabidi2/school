"use client";

import { useState, useEffect } from "react";
import { getAllExpenses, updateExpenseStatus } from "@/lib/actions";
import { Expense } from "@prisma/client";

export default function ValidationPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const data = await getAllExpenses();
        setExpenses(data);
      } catch (error) {
        console.error('Erreur lors du chargement des dépenses:', error);
      }
    };
    fetchExpenses();
  }, []);

  const handleStatusUpdate = async (expenseId: number, newStatus: 'APPROVED' | 'REJECTED') => {
    setLoading(true);
    try {
      const result = await updateExpenseStatus({ success: false, error: false }, {
        expenseId,
        status: newStatus
      });
      
      if (result.success) {
        // Recharger les données
        const data = await getAllExpenses();
        setExpenses(data);
        alert(`Dépense ${newStatus === 'APPROVED' ? 'approuvée' : 'rejetée'} avec succès!`);
      } else {
        alert('Erreur lors de la mise à jour du statut');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la mise à jour du statut');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'APPROVED':
        return 'bg-green-100 text-green-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'En attente';
      case 'APPROVED':
        return 'Approuvée';
      case 'REJECTED':
        return 'Rejetée';
      default:
        return status;
    }
  };

  const pendingExpenses = expenses.filter(e => e.status === 'PENDING');
  const approvedExpenses = expenses.filter(e => e.status === 'APPROVED');
  const rejectedExpenses = expenses.filter(e => e.status === 'REJECTED');

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      <div className="mb-6">
        <h1 className="text-lg font-semibold mb-2">Validation des Dépenses</h1>
        <p className="text-gray-600">Gérez l&apos;approbation et le rejet des dépenses</p>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-yellow-50 p-4 rounded-lg">
          <h3 className="font-medium text-yellow-800">En attente</h3>
          <p className="text-2xl font-bold text-yellow-900">{pendingExpenses.length}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="font-medium text-green-800">Approuvées</h3>
          <p className="text-2xl font-bold text-green-900">{approvedExpenses.length}</p>
        </div>
        <div className="bg-red-50 p-4 rounded-lg">
          <h3 className="font-medium text-red-800">Rejetées</h3>
          <p className="text-2xl font-bold text-red-900">{rejectedExpenses.length}</p>
        </div>
      </div>

      {/* Dépenses en attente */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4 text-yellow-800">Dépenses en attente de validation</h2>
        {pendingExpenses.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Aucune dépense en attente</p>
        ) : (
          <div className="space-y-4">
            {pendingExpenses.map((expense) => (
              <div key={expense.id} className="border border-yellow-200 rounded-lg p-4 bg-yellow-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{expense.title}</h3>
                    {expense.description && (
                      <p className="text-gray-600 mt-1">{expense.description}</p>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                      <span className="font-medium">{expense.amount.toFixed(2)} TND</span>
                      <span>{new Date(expense.date).toLocaleDateString('fr-FR')}</span>
                      <span>Créé par: {expense.createdBy}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleStatusUpdate(expense.id, 'APPROVED')}
                      disabled={loading}
                      className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 disabled:opacity-50 flex items-center gap-2"
                    >
                      ✅ Approuver
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(expense.id, 'REJECTED')}
                      disabled={loading}
                      className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 disabled:opacity-50 flex items-center gap-2"
                    >
                      ❌ Rejeter
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Toutes les dépenses */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Toutes les dépenses</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left p-3 font-medium">Titre</th>
                <th className="text-left p-3 font-medium">Description</th>
                <th className="text-left p-3 font-medium">Montant</th>
                <th className="text-left p-3 font-medium">Statut</th>
                <th className="text-left p-3 font-medium">Date</th>
                <th className="text-left p-3 font-medium">Créé par</th>
                <th className="text-left p-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {expenses.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center p-8 text-gray-500">
                    Aucune dépense enregistrée
                  </td>
                </tr>
              ) : (
                expenses.map((expense) => (
                  <tr key={expense.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="p-3 font-medium">{expense.title}</td>
                    <td className="p-3 text-gray-600 max-w-xs truncate">
                      {expense.description || '-'}
                    </td>
                    <td className="p-3 font-medium">{expense.amount.toFixed(2)} TND</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(expense.status)}`}>
                        {getStatusText(expense.status)}
                      </span>
                    </td>
                    <td className="p-3 text-gray-600">
                      {new Date(expense.date).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="p-3 text-gray-600">{expense.createdBy}</td>
                    <td className="p-3">
                      {expense.status === 'PENDING' && (
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleStatusUpdate(expense.id, 'APPROVED')}
                            disabled={loading}
                            className="bg-green-500 text-white px-2 py-1 rounded text-xs hover:bg-green-600 disabled:opacity-50"
                            title="Approuver"
                          >
                            ✅
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(expense.id, 'REJECTED')}
                            disabled={loading}
                            className="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600 disabled:opacity-50"
                            title="Rejeter"
                          >
                            ❌
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
