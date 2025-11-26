import Annonces from "@/components/Announcements";
import BigCalendarContainer from "@/components/BigCalendarContainer";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

// Page Parent (FR)
const PageParent = async () => {
  const { userId } = await auth();
  const currentUserId = userId;

  // Récupérer les élèves liés à ce parent
  const eleves = await prisma.student.findMany({
    where: {
      parentId: currentUserId!,
    },
  });

  return (
    <div className="flex-1 p-4 flex gap-4 flex-col xl:flex-row">
      {/* GAUCHE */}
      <div className="">
        {eleves.map((eleve) => (
          <div className="w-full xl:w-2/3" key={eleve.id}>
            <div className="h-full bg-white p-4 rounded-md">
              <h1 className="text-xl font-semibold">
                Emploi du temps ({eleve.name + " " + eleve.surname})
              </h1>
              <BigCalendarContainer type="classId" id={eleve.classId} />
            </div>
          </div>
        ))}
      </div>
      {/* DROITE */}
      <div className="w-full xl:w-1/3 flex flex-col gap-8">
        <Annonces />
      </div>
    </div>
  );
};

export default PageParent;
