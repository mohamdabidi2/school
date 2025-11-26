"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { Class, Payment, Student } from "@prisma/client";
import { ITEM_PER_PAGE } from "@/lib/settings";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import Pagination from "@/components/Pagination";
import MobileDataCards from "@/components/MobileDataCards";
import PaymentDetails from "@/components/PaymentDetails";
import OverduePaymentsAlert from "@/components/OverduePaymentsAlert";

type StudentWithPayments = Student & {
  payments: Payment[];
  class: Class;
};

const getTotalAmount = (student: StudentWithPayments) => {
  if (student.totalAmount) return Number(student.totalAmount);
  if (student.paymentType === "complete" && student.payments.length) {
    return Math.max(...student.payments.map((p) => p.amount));
  }
  return 0;
};

const formatCurrency = (value?: number | null) => {
  if (!value || Number.isNaN(value)) return "-";
  return `${value.toFixed(2)} TND`;
};

export default function PaymentsPage() {
  const [students, setStudents] = useState<StudentWithPayments[]>([]);
  const [selectedStudent, setSelectedStudent] =
    useState<StudentWithPayments | null>(null);
  const [showPaymentDetails, setShowPaymentDetails] = useState(false);
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();

  const searchTerm =
    searchParams.get("search")?.toLowerCase().trim() ?? "";
  const pageParam = parseInt(searchParams.get("page") ?? "1", 10);
  const page = Number.isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/students-with-payments");
      const data = await response.json();
      setStudents(data);
    } catch (error) {
      console.error("Erreur lors du chargement des étudiants:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const filteredStudents = useMemo(() => {
    if (!searchTerm) return students;
    return students.filter((student) => {
      const values = [
        student.name,
        student.surname,
        student.username,
        student.class?.name,
      ]
        .filter(Boolean)
        .map((value) => value!.toLowerCase());
      return values.some((value) => value.includes(searchTerm));
    });
  }, [students, searchTerm]);

  const totalCount = filteredStudents.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / ITEM_PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * ITEM_PER_PAGE;
  const paginatedStudents = filteredStudents.slice(
    startIndex,
    startIndex + ITEM_PER_PAGE
  );

  const totals = useMemo(() => {
    const total = students.reduce(
      (acc, student) => acc + getTotalAmount(student),
      0
    );
    const paid = students.reduce(
      (acc, student) =>
        acc + student.payments.reduce((sum, payment) => sum + payment.amount, 0),
      0
    );
    return {
      total,
      paid,
      remaining: total - paid,
      overdue: students.filter((student) =>
        student.payments.some(
          (payment) =>
            !payment.paid && payment.dueDate && new Date(payment.dueDate) < new Date()
        )
      ).length,
    };
  }, [students]);

  const handleViewPaymentDetails = (student: StudentWithPayments) => {
    setSelectedStudent(student);
    setShowPaymentDetails(true);
  };

  const handlePaymentDetailsClose = () => {
    setShowPaymentDetails(false);
    setSelectedStudent(null);
  };

  const handlePaymentAdded = () => {
    fetchStudents();
  };

  const columns = [
    { enTete: "Élève", cle: "student" },
    { enTete: "Classe", cle: "class", classeNom: "hidden lg:table-cell" },
    { enTete: "Type", cle: "type", classeNom: "hidden md:table-cell" },
    { enTete: "Montant total", cle: "total", classeNom: "hidden md:table-cell" },
    { enTete: "Payé", cle: "paid", classeNom: "hidden md:table-cell" },
    { enTete: "Reste", cle: "remaining", classeNom: "hidden md:table-cell" },
    { enTete: "Actions", cle: "actions" },
  ];

  const renderRow = (student: StudentWithPayments) => {
    const totalAmount = getTotalAmount(student);
    const paidAmount = student.payments.reduce(
      (sum, payment) => sum + payment.amount,
      0
    );
    const remainingAmount = totalAmount ? totalAmount - paidAmount : 0;

    return (
      <tr
        key={student.id}
        className="border-b border-gray-200 text-sm hover:bg-lamaPurpleLight transition-colors"
      >
        <td className="p-4">
          <div className="flex items-center gap-3">
            <Image
              src={student.img || "/noAvatar.png"}
              alt={student.name}
              width={40}
              height={40}
              className="h-10 w-10 rounded-full object-cover"
            />
            <div className="flex flex-col">
              <span className="font-semibold">
                {student.name} {student.surname}
              </span>
              <span className="text-xs text-gray-500">@{student.username}</span>
            </div>
          </div>
        </td>
        <td className="hidden lg:table-cell">{student.class?.name || "-"}</td>
        <td className="hidden md:table-cell">
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              student.paymentType === "complete"
                ? "bg-green-100 text-green-700"
                : "bg-blue-100 text-blue-700"
            }`}
          >
            {student.paymentType === "complete" ? "Complet" : "Tranches"}
          </span>
        </td>
        <td className="hidden md:table-cell">{formatCurrency(totalAmount)}</td>
        <td className="hidden md:table-cell">{formatCurrency(paidAmount)}</td>
        <td className="hidden md:table-cell font-semibold">
          {formatCurrency(remainingAmount)}
        </td>
        <td className="p-4">
          <button
            onClick={() => handleViewPaymentDetails(student)}
            className="px-3 py-1 rounded-full bg-lamaSky text-xs font-semibold text-white hover:scale-105 transition"
          >
            Détails
          </button>
        </td>
      </tr>
    );
  };

  const mobileCardData = paginatedStudents.map((student) => {
    const totalAmount = getTotalAmount(student);
    const paidAmount = student.payments.reduce(
      (sum, payment) => sum + payment.amount,
      0
    );
    const remainingAmount = totalAmount ? totalAmount - paidAmount : 0;

    return {
      id: student.id,
      title: `${student.name} ${student.surname}`,
      subtitle: student.class?.name,
      image: student.img || undefined,
      badge: {
        text: student.paymentType === "complete" ? "Complet" : "Tranches",
        color:
          student.paymentType === "complete"
            ? "bg-green-100 text-green-700"
            : "bg-blue-100 text-blue-700",
      },
      details: [
        {
          icon: "/finance.png",
          label: "Total",
          value: formatCurrency(totalAmount),
        },
        {
          icon: "/finance.png",
          label: "Payé",
          value: formatCurrency(paidAmount),
        },
        {
          icon: "/finance.png",
          label: "Reste",
          value: formatCurrency(remainingAmount),
        },
      ],
      actions: [
        {
          label: "Voir les détails",
          variant: "primary" as const,
          onClick: () => handleViewPaymentDetails(student),
        },
      ],
    };
  });

  return (
    <>
      {showPaymentDetails && selectedStudent && (
        <PaymentDetails
          student={selectedStudent}
          onClose={handlePaymentDetailsClose}
          onPaymentAdded={handlePaymentAdded}
        />
      )}

      <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0 space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-lg font-semibold">Gestion des Paiements</h1>
            <p className="text-sm text-gray-500">
              Suivez les encaissements, retards et relances en un coup d&apos;œil.
            </p>
          </div>
          <div className="flex w-full flex-col gap-3 md:w-auto md:flex-row md:items-center">
            <TableSearch />
            <button
              onClick={async () => {
                try {
                  const res = await fetch("/api/export/payments");
                  if (!res.ok) throw new Error("Export failed");
                  const blob = await res.blob();
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = "students_payments.csv";
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
              Exporter CSV
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Total facturé
            </p>
            <p className="text-2xl font-semibold text-slate-900">
              {formatCurrency(totals.total)}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-emerald-50 p-4">
            <p className="text-xs uppercase tracking-wide text-emerald-700">
              Encaissements
            </p>
            <p className="text-2xl font-semibold text-emerald-900">
              {formatCurrency(totals.paid)}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-amber-50 p-4">
            <p className="text-xs uppercase tracking-wide text-amber-700">
              Restant dû
            </p>
            <p className="text-2xl font-semibold text-amber-900">
              {formatCurrency(totals.remaining)}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-rose-50 p-4">
            <p className="text-xs uppercase tracking-wide text-rose-700">
              Retards critiques
            </p>
            <p className="text-2xl font-semibold text-rose-900">
              {totals.overdue}
            </p>
          </div>
        </div>

        <OverduePaymentsAlert />

        <div className="hidden md:block">
          {loading ? (
            <div className="py-10 text-center text-sm text-gray-500">
              Chargement des paiements...
            </div>
          ) : (
            <>
              <Table
                colonnes={columns}
                afficherLigne={renderRow}
                donnees={paginatedStudents}
              />
              <Pagination page={currentPage} count={totalCount} />
            </>
          )}
        </div>

        <div className="md:hidden">
          <MobileDataCards
            title="Paiements"
            subtitle={`${totalCount} élève${
              totalCount > 1 ? "s" : ""
            } suivi${totalCount > 1 ? "s" : ""}`}
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
