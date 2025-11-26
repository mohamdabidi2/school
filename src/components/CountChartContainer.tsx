import Image from "next/image";
import CountChart from "./CountChart";
import prisma from "@/lib/prisma";

const CountChartContainer = async () => {
  const data = await prisma.student.groupBy({
    by: ["sex"],
    _count: true,
  });

  const garcons = data.find((d) => d.sex === "MALE")?._count || 0;
  const filles = data.find((d) => d.sex === "FEMALE")?._count || 0;

  return (
    <div className="bg-white rounded-xl w-full h-full p-4">
      {/* TITRE */}
      <div className="flex justify-between items-center">
        <h1 className="text-lg font-semibold">Élèves</h1>
        <Image src="/moreDark.png" alt="" width={20} height={20} />
      </div>
      {/* GRAPHIQUE */}
      <CountChart boys={garcons} girls={filles} />
      {/* BAS */}
      <div className="flex justify-center gap-16">
        <div className="flex flex-col gap-1">
          <div className="w-5 h-5 bg-lamaSky rounded-full" />
          <h1 className="font-bold">{garcons}</h1>
          <h2 className="text-xs text-gray-300">
            Garçons ({garcons + filles > 0 ? Math.round((garcons / (garcons + filles)) * 100) : 0}%)
          </h2>
        </div>
        <div className="flex flex-col gap-1">
          <div className="w-5 h-5 bg-lamaYellow rounded-full" />
          <h1 className="font-bold">{filles}</h1>
          <h2 className="text-xs text-gray-300">
            Filles ({garcons + filles > 0 ? Math.round((filles / (garcons + filles)) * 100) : 0}%)
          </h2>
        </div>
      </div>
    </div>
  );
};

export default CountChartContainer;
