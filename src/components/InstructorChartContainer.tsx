import Image from "next/image";
import InstructorChart from "./InstructorChart";
import prisma from "@/lib/prisma";

const InstructorChartContainer = async () => {
  const data = await prisma.teacher.groupBy({
    by: ["sex"],
    _count: true,
  });

  const hommes = data.find((d) => d.sex === "MALE")?._count || 0;
  const femmes = data.find((d) => d.sex === "FEMALE")?._count || 0;

  return (
    <div className="bg-white rounded-xl w-full h-full p-4">
      {/* TITRE */}
      <div className="flex justify-between items-center">
        <h1 className="text-lg font-semibold">Enseignants</h1>
        <Image src="/moreDark.png" alt="" width={20} height={20} />
      </div>
      {/* GRAPHIQUE */}
      <InstructorChart male={hommes} female={femmes} />
      {/* BAS */}
      <div className="flex justify-center gap-16">
        <div className="flex flex-col gap-1">
          <div className="w-5 h-5 bg-blue-500 rounded-full" />
          <h1 className="font-bold">{hommes}</h1>
          <h2 className="text-xs text-gray-300">
            Hommes ({hommes + femmes > 0 ? Math.round((hommes / (hommes + femmes)) * 100) : 0}%)
          </h2>
        </div>
        <div className="flex flex-col gap-1">
          <div className="w-5 h-5 bg-pink-500 rounded-full" />
          <h1 className="font-bold">{femmes}</h1>
          <h2 className="text-xs text-gray-300">
            Femmes ({hommes + femmes > 0 ? Math.round((femmes / (hommes + femmes)) * 100) : 0}%)
          </h2>
        </div>
      </div>
    </div>
  );
};

export default InstructorChartContainer;
