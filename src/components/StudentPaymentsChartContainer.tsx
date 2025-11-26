import prisma from "@/lib/prisma";
import StudentPaymentsChart from "./StudentPaymentsChart";

type RoleContext = {
  parentId?: string;
  studentId?: string;
};

const StudentPaymentsChartContainer = async ({ context }: { context?: RoleContext } = {}) => {
  // Get all students with their payments
  const students = await prisma.student.findMany({
    where: {
      ...(context?.studentId ? { id: context.studentId } : {}),
      ...(context?.parentId ? { parentId: context.parentId } : {}),
    },
    include: { payments: true },
  });

  // Calculate total amounts
  const totalToPay = students.reduce((sum, student) => {
    // Assuming each student has a fixed monthly fee (you might want to get this from a config or student record)
    const monthlyFee = 500; // 500 TND per month - adjust this based on your business logic
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();
    
    // Calculate how many months they should have paid for (from start of academic year to current month)
    const academicYearStart = new Date(currentYear, 8, 1); // September 1st
    const monthsToPay = Math.max(0, currentMonth - 8 + 1); // From September to current month
    
    return sum + (monthlyFee * monthsToPay);
  }, 0);

  const totalPaid = students.reduce((sum, student) => {
    return sum + student.payments.reduce((studentSum, payment) => {
      return studentSum + (payment.paid ? payment.amount : 0);
    }, 0);
  }, 0);

  const remainingToPay = totalToPay - totalPaid;
  const paymentPercentage = totalToPay > 0 ? (totalPaid / totalToPay) * 100 : 0;
  const studentsWithPayments = students.filter(student => 
    student.payments.some(payment => payment.paid)
  ).length;

  const chartData = {
    totalToPay,
    totalPaid,
    remainingToPay,
    paymentPercentage,
    totalStudents: students.length,
    studentsWithPayments,
  };

  return <StudentPaymentsChart data={chartData} />;
};

export default StudentPaymentsChartContainer;
