import Image from "next/image";
import PaymentChart from "./PaymentChart";
import prisma from "@/lib/prisma";

const PaymentChartContainer = async () => {
  // Get paid amounts from payments
  const paymentData = await prisma.payment.groupBy({
    by: ["paid"],
    _count: { paid: true },
    _sum: { amount: true },
  });

  const paidAmount = paymentData.find(p => p.paid)?._sum.amount || 0;
  
  // Get total amount from students (their payment obligations)
  const studentsTotalAmount = await prisma.student.aggregate({
    _sum: {
      totalAmount: true,
    },
  });

  const totalStudentAmount = studentsTotalAmount._sum.totalAmount || 0;
  const restAmount = totalStudentAmount - paidAmount;

  const data = [
    {
      name: "Payé",
      value: paidAmount,
      color: "#10B981", // Green
    },
    {
      name: "Rest",
      value: restAmount,
      color: "#F59E0B", // Orange
    },
  ];

  return (
    <div className="bg-white rounded-xl w-full h-full p-4">
      <div className="flex justify-between items-center">
        <h1 className="text-lg font-semibold">Paiements</h1>
        <Image src="/moreDark.png" alt="" width={20} height={20} />
      </div>
      <PaymentChart data={data} />
      <div className="flex justify-center gap-8 mt-4">
        <div className="flex flex-col gap-1">
          <div className="w-5 h-5 bg-green-500 rounded-full" />
          <h1 className="font-bold">{paidAmount.toFixed(0)} TND</h1>
          <h2 className="text-xs text-gray-300">Payé</h2>
        </div>
        <div className="flex flex-col gap-1">
          <div className="w-5 h-5 bg-orange-500 rounded-full" />
          <h1 className="font-bold">{restAmount.toFixed(0)} TND</h1>
          <h2 className="text-xs text-gray-300">Rest</h2>
        </div>
      </div>
    </div>
  );
};

export default PaymentChartContainer;
