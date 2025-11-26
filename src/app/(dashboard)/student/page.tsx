import Annonces from "@/components/Announcements";
import BigCalendarContainer from "@/components/BigCalendarContainer";
import BigCalendar from "@/components/BigCalender";
import EventCalendar from "@/components/EventCalendar";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

// Page Étudiant (FR)
const PageEtudiant = async () => {
  const { userId } = await auth();

  // Récupération de la classe de l'étudiant connecté
  const classe = await prisma.class.findFirst({
    where: {
      students: { some: { id: userId! } },
    },
  });

  return (
    <div className="p-4 flex gap-4 flex-col xl:flex-row">
      {/* GAUCHE */}
      <div className="w-full xl:w-2/3">
        <div className="h-full bg-white p-4 rounded-md">
          <h1 className="text-xl font-semibold">
            Emploi du temps
            {classe && classe.name ? ` (${classe.name})` : ""}
          </h1>
          {classe ? (
            <BigCalendarContainer type="classId" id={classe.id} />
          ) : (
            <p>Impossible de trouver la classe.</p>
          )}
        </div>
      </div>
      {/* DROITE */}
      <div className="w-full xl:w-1/3 flex flex-col gap-8">
        <EventCalendar />
        <Annonces />
      </div>
    </div>
  );
};

export default PageEtudiant;
