import Image from "next/image";
import InstructorAbsenceChart from "./InstructorAbsenceChart";
import prisma from "@/lib/prisma";

const InstructorAbsenceChartContainer = async () => {
  // Get absences for the last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const absencesData = await prisma.teacherAbsence.findMany({
    where: {
      date: {
        gte: thirtyDaysAgo,
      },
    },
    include: {
      teacher: {
        select: {
          name: true,
          surname: true,
        },
      },
    },
  });

  // Group absences by teacher
  const teacherAbsences: { [key: string]: number } = {};
  
  absencesData.forEach((absence) => {
    const teacherName = `${absence.teacher.name} ${absence.teacher.surname}`;
    teacherAbsences[teacherName] = (teacherAbsences[teacherName] || 0) + 1;
  });

  // Convert to array and sort by absences (descending)
  const data = Object.entries(teacherAbsences)
    .map(([name, absences]) => ({ name, absences }))
    .sort((a, b) => b.absences - a.absences)
    .slice(0, 5); // Top 5 teachers with most absences

  return (
    <div className="bg-white rounded-lg p-4 h-full">
      <div className="flex justify-between items-center">
        <h1 className="text-lg font-semibold">Absences Enseignants</h1>
        <Image src="/moreDark.png" alt="" width={20} height={20} />
      </div>
      <InstructorAbsenceChart data={data} />
    </div>
  );
};

export default InstructorAbsenceChartContainer;
