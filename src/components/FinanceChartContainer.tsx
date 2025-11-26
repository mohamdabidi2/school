import Image from "next/image";
import FinanceChart from "./FinanceChart";
import prisma from "@/lib/prisma";

const FinanceChartContainer = async () => {
  // Get real financial data from database
  const [paymentsData, expensesData] = await Promise.all([
    // Get payments by month
    prisma.payment.groupBy({
      by: ['date'],
      _sum: { amount: true },
      where: { paid: true },
    }),
    // Get expenses by month (only approved expenses)
    prisma.expense.groupBy({
      by: ['date'],
      _sum: { amount: true },
      where: { status: 'APPROVED' },
    }),
  ]);

  // Create monthly data for the last 6 months
  const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin'];
  const currentDate = new Date();
  
  const donnees = months.map((month, index) => {
    const targetDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - (5 - index), 1);
    
    // Find payments for this month
    const monthPayments = paymentsData.filter(p => {
      const paymentDate = new Date(p.date);
      return paymentDate.getMonth() === targetDate.getMonth() && 
             paymentDate.getFullYear() === targetDate.getFullYear();
    });
    
    // Find expenses for this month
    const monthExpenses = expensesData.filter(e => {
      const expenseDate = new Date(e.date);
      return expenseDate.getMonth() === targetDate.getMonth() && 
             expenseDate.getFullYear() === targetDate.getFullYear();
    });
    
    const revenu = monthPayments.reduce((sum, p) => sum + (p._sum.amount || 0), 0);
    const depense = monthExpenses.reduce((sum, e) => sum + (e._sum.amount || 0), 0);
    
    return {
      nom: month,
      revenu,
      depense,
    };
  });

  return (
    <div className="bg-white rounded-xl w-full h-full p-4">
      <div className="flex justify-between items-center">
        <h1 className="text-lg font-semibold">Finances (Dépenses Acceptées)</h1>
        <Image src="/moreDark.png" alt="Plus d'options" width={20} height={20} />
      </div>
      <FinanceChart data={donnees} />
    </div>
  );
};

export default FinanceChartContainer;
