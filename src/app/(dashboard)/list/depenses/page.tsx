"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Expense } from "@prisma/client";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import Pagination from "@/components/Pagination";
import MobileDataCards from "@/components/MobileDataCards";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { createExpense, getAllExpenses } from "@/lib/actions";

const statusConfig: Record<
  Expense["status"],
  { label: string; color: string }
> = {
  PENDING: { label: "En attente", color: "bg-amber-100 text-amber-700" },
  APPROVED: { label: "Approuvée", color: "bg-emerald-100 text-emerald-700" },
  REJECTED: { label: "Rejetée", color: "bg-rose-100 text-rose-700" },
};

const formatCurrency = (value: number) => `${value.toFixed(2)} TND`;

export default function DepensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    amount: "",
    createdBy: "admin",
  });
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();

  const searchTerm =
    searchParams.get("search")?.toLowerCase().trim() ?? "";
  const pageParam = parseInt(searchParams.get("page") ?? "1", 10);
  const page = Number.isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const data = await getAllExpenses();
      setExpenses(data);
    } catch (error) {
      console.error("Erreur lors du chargement des dépenses:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const filteredExpenses = useMemo(() => {
    if (!searchTerm) return expenses;
    return expenses.filter((expense) => {
      const values = [
        expense.title,
        expense.description,
        expense.createdBy,
        expense.status,
      ]
        .filter(Boolean)
        .map((value) => value!.toLowerCase());
      return values.some((value) => value.includes(searchTerm));
    });
  }, [expenses, searchTerm]);

  const totalCount = filteredExpenses.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / ITEM_PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * ITEM_PER_PAGE;
  const paginatedExpenses = filteredExpenses.slice(
    startIndex,
    startIndex + ITEM_PER_PAGE
  );

  const stats = useMemo(() => {
    return {
      totalAmount: expenses.reduce((sum, expense) => sum + expense.amount, 0),
      pending: expenses.filter((e) => e.status === "PENDING").length,
      approved: expenses.filter((e) => e.status === "APPROVED").length,
    };
  }, [expenses]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const amountNumber = Number(formData.amount);
      const result = await createExpense(
        { success: false, error: false },
        {
          title: formData.title,
          description: formData.description,
          amount: Number.isNaN(amountNumber) ? 0 : amountNumber,
          createdBy: formData.createdBy,
        }
      );

      if (result.success) {
        await fetchExpenses();
        setShowForm(false);
        setFormData({ title: "", description: "", amount: "", createdBy: "admin" });
        alert("Dépense ajoutée avec succès!");
      } else {
        alert("Erreur lors de l'ajout de la dépense");
      }
    } catch (error) {
      console.error("Erreur:", error);
      alert("Erreur lors de l'ajout de la dépense");
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    { enTete: "Dépense", cle: "title" },
    { enTete: "Montant", cle: "amount", classeNom: "hidden md:table-cell" },
    { enTete: "Statut", cle: "status", classeNom: "hidden md:table-cell" },
    { enTete: "Date", cle: "date", classeNom: "hidden lg:table-cell" },
    { enTete: "Créé par", cle: "creator", classeNom: "hidden lg:table-cell" },
  ];

  const renderRow = (expense: Expense) => {
    const status = statusConfig[expense.status];
    return (
      <tr
        key={expense.id}
        className="border-b border-gray-200 text-sm hover:bg-lamaPurpleLight transition-colors"
      >
        <td className="p-4">
          <div className="flex flex-col gap-1">
            <span className="font-semibold text-gray-900">{expense.title}</span>
            <span className="text-xs text-gray-500 line-clamp-1">
              {expense.description || "—"}
            </span>
          </div>
        </td>
        <td className="hidden md:table-cell font-semibold">
          {formatCurrency(expense.amount)}
        </td>
        <td className="hidden md:table-cell">
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${status?.color}`}
          >
            {status?.label ?? expense.status}
          </span>
        </td>
        <td className="hidden lg:table-cell">
          {new Date(expense.date).toLocaleDateString("fr-FR")}
        </td>
        <td className="hidden lg:table-cell">{expense.createdBy || "—"}</td>
      </tr>
    );
  };

  const mobileCardData = paginatedExpenses.map((expense) => ({
    id: expense.id,
    title: expense.title,
    subtitle: new Date(expense.date).toLocaleDateString("fr-FR"),
    description: expense.description || undefined,
    badge: {
      text: statusConfig[expense.status].label,
      color: statusConfig[expense.status].color,
    },
    details: [
      {
        icon: "/finance.png",
        label: "Montant",
        value: formatCurrency(expense.amount),
      },
      {
        icon: "/user.png",
        label: "Créé par",
        value: expense.createdBy || "Non renseigné",
      },
    ],
  }));

  return (
    <>
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-slate-100 bg-white/95 p-6 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Ajouter une dépense</h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-slate-400 transition hover:text-slate-600"
              >
                ✕
              </button>
            </div>
            <form className="form-card shadow-none border-none p-0" onSubmit={handleSubmit}>
              <div className="form-field">
                <label className="input-label">Titre</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, title: e.target.value }))
                  }
                  className="form-input"
                  required
                />
              </div>
              <div className="form-field">
                <label className="input-label">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  className="form-textarea"
                  placeholder="Optionnel"
                />
              </div>
              <div className="form-field">
                <label className="input-label">Montant (TND)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, amount: e.target.value }))
                  }
                  className="form-input"
                  required
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="form-primary-btn w-full justify-center disabled:opacity-50"
                >
                  {submitting ? "Ajout..." : "Ajouter"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="form-secondary-btn w-full justify-center"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0 space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-lg font-semibold">Gestion des Dépenses</h1>
            <p className="text-sm text-gray-500">
              Contrôlez les engagements financiers et la trésorerie de l&apos;école.
            </p>
          </div>
          <div className="flex w-full flex-col gap-3 md:w-auto md:flex-row md:items-center">
            <TableSearch />
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowForm(true)}
                className="rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500"
              >
                Ajouter
              </button>
              <button
                onClick={async () => {
                  try {
                    const res = await fetch("/api/export/expenses");
                    if (!res.ok) throw new Error("Export failed");
                    const blob = await res.blob();
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = "expenses.csv";
                    document.body.appendChild(a);
                    a.click();
                    a.remove();
                    window.URL.revokeObjectURL(url);
                  } catch (err) {
                    console.error(err);
                    alert("Erreur lors de l'export CSV");
                  }
                }}
                className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500"
              >
                Exporter
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Total déclaré
            </p>
            <p className="text-2xl font-semibold text-slate-900">
              {formatCurrency(stats.totalAmount)}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-amber-50 p-4">
            <p className="text-xs uppercase tracking-wide text-amber-700">
              En attente
            </p>
            <p className="text-2xl font-semibold text-amber-900">{stats.pending}</p>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-emerald-50 p-4">
            <p className="text-xs uppercase tracking-wide text-emerald-700">
              Approuvées
            </p>
            <p className="text-2xl font-semibold text-emerald-900">{stats.approved}</p>
          </div>
        </div>

        <div className="hidden md:block">
          {loading ? (
            <div className="py-10 text-center text-sm text-gray-500">
              Chargement des dépenses...
            </div>
          ) : (
            <>
              <Table
                colonnes={columns}
                afficherLigne={renderRow}
                donnees={paginatedExpenses}
              />
              <Pagination page={currentPage} count={totalCount} />
            </>
          )}
        </div>

        <div className="md:hidden">
          <MobileDataCards
            title="Dépenses"
            subtitle={`${totalCount} dépense${
              totalCount > 1 ? "s" : ""
            } suivie${totalCount > 1 ? "s" : ""}`}
            items={mobileCardData}
            totalCount={totalCount}
            showPagination={totalCount > ITEM_PER_PAGE}
            currentPage={currentPage}
            totalPages={totalPages}
          />
        </div>
      </div>
    </>
  );
}
