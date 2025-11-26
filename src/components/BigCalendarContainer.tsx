import prisma from "@/lib/prisma";
import BigCalendar from "./BigCalender";
import { 
  transformLessonsToEvents, 
  adjustScheduleToCurrentWeek, 
  getScheduleStats,
  ScheduleEvent 
} from "@/lib/scheduleUtils";

// Interface pour les props du conteneur
interface BigCalendarContainerProps {
  type: "teacherId" | "classId";
  id: string | number;
  title?: string;
  showStats?: boolean;
  onEventClick?: (event: ScheduleEvent) => void;
}

// Composant pour afficher le calendrier principal avec les leçons d'un enseignant ou d'une classe
const BigCalendarContainer = async ({
  type,
  id,
  title,
  showStats = true,
  onEventClick,
}: BigCalendarContainerProps) => {
  // Récupération des leçons selon le type (enseignant ou classe)
  const lessons = await prisma.lesson.findMany({
    where: {
      ...(type === "teacherId"
        ? { teacherId: id as string }
        : { classId: id as number }),
    },
    include: {
      subject: true,
      class: true,
      teacher: true,
    },
    orderBy: {
      startTime: 'asc',
    },
  });

  // Transformation des données pour le calendrier
  const events = transformLessonsToEvents(lessons);

  // Ajustement de l'emploi du temps à la semaine courante
  const adjustedEvents = adjustScheduleToCurrentWeek(events);

  // Statistiques du planning
  const stats = getScheduleStats(adjustedEvents);

  // Génération du titre dynamique
  const dynamicTitle = title || (() => {
    if (type === "teacherId") {
      const teacher = lessons[0]?.teacher;
      return teacher ? `Emploi du temps - ${teacher.name} ${teacher.surname}` : "Emploi du temps";
    } else {
      const classInfo = lessons[0]?.class;
      return classInfo ? `Emploi du temps - ${classInfo.name}` : "Emploi du temps";
    }
  })();

  return (
    <div className="h-full">
      <BigCalendar 
        events={adjustedEvents}
        title={dynamicTitle}
        showStats={showStats}
        onEventClick={onEventClick}
      />
    </div>
  );
};

export default BigCalendarContainer;
