import Image from "next/image";
import AttendanceChart from "./AttendanceChart";
import prisma from "@/lib/prisma";

type RoleContext = {
  parentId?: string;
  studentId?: string;
  teacherId?: string;
};

const AttendanceChartContainer = async ({ context }: { context?: RoleContext } = {}) => {
  const aujourdHui = new Date();
  const jourSemaine = aujourdHui.getDay();
  const joursDepuisLundi = jourSemaine === 0 ? 6 : jourSemaine - 1;

  const dernierLundi = new Date(aujourdHui);

  dernierLundi.setDate(aujourdHui.getDate() - joursDepuisLundi);

  const donneesRequete = await prisma.attendance.findMany({
    where: {
      date: { gte: dernierLundi },
      ...(context?.studentId ? { studentId: context.studentId } : {}),
      ...(context?.parentId ? { student: { parentId: context.parentId } } : {}),
      ...(context?.teacherId ? { lesson: { teacherId: context.teacherId } } : {}),
    },
    select: {
      date: true,
      present: true,
    },
  });

  // console.log(donneesRequete)

  const joursSemaine = ["Lun", "Mar", "Mer", "Jeu", "Ven"];

  const cartePresence: { [key: string]: { present: number; absent: number } } = {
    Lun: { present: 0, absent: 0 },
    Mar: { present: 0, absent: 0 },
    Mer: { present: 0, absent: 0 },
    Jeu: { present: 0, absent: 0 },
    Ven: { present: 0, absent: 0 },
  };

  donneesRequete.forEach((item) => {
    const dateItem = new Date(item.date);
    const jour = dateItem.getDay();

    if (jour >= 1 && jour <= 5) {
      const nomJour = joursSemaine[jour - 1];

      if (item.present) {
        cartePresence[nomJour].present += 1;
      } else {
        cartePresence[nomJour].absent += 1;
      }
    }
  });

  const donnees = joursSemaine.map((jour) => ({
    name: jour,
    present: cartePresence[jour].present,
    absent: cartePresence[jour].absent,
  }));

  return (
    <div className="bg-white rounded-lg p-4 h-full">
      <div className="flex justify-between items-center">
        <h1 className="text-lg font-semibold">Présence</h1>
        <Image src="/moreDark.png" alt="" width={20} height={20} />
      </div>
      <AttendanceChart data={donnees}/>
    </div>
  );
};

export default AttendanceChartContainer;
