"use client";

import { Calendar, momentLocalizer, View, Views } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useState, useMemo } from "react";
import { ScheduleEvent, getSubjectColor, getWorkingHours } from "@/lib/scheduleUtils";
import EventDetailsModal from "./EventDetailsModal";

// Localisateur pour le calendrier utilisant moment.js
const localisateur = momentLocalizer(moment);

// Composant personnalisé pour l'affichage des événements en vue semaine
const EventComponentWeek = ({ event }: { event: ScheduleEvent }) => (
  <div className="h-full p-1 text-xs cursor-pointer hover:opacity-80 transition-opacity">
    <div className="font-semibold truncate text-gray-800">{event.title}</div>
    {event.resource && (
      <div className="text-gray-600 truncate text-xs">
        {event.resource.teacher}
      </div>
    )}
  </div>
);

// Composant personnalisé pour l'affichage des événements en vue jour
const EventComponentDay = ({ event }: { event: ScheduleEvent }) => {
  const subjectColor = getSubjectColor(event.resource.subject);
  
  return (
    <div 
      className="h-full p-2 text-xs border-l-4 rounded-r-md shadow-sm hover:shadow-md transition-shadow"
      style={{
        backgroundColor: subjectColor.backgroundColor,
        borderLeftColor: subjectColor.borderColor,
      }}
    >
      <div 
        className="font-semibold truncate"
        style={{ color: subjectColor.textColor }}
      >
        {event.title}
      </div>
      {event.resource && (
        <div 
          className="truncate text-xs opacity-80"
          style={{ color: subjectColor.textColor }}
        >
          {event.resource.teacher}
        </div>
      )}
    </div>
  );
};

// Interface pour les props du composant
interface BigCalendarProps {
  events: ScheduleEvent[];
  title?: string;
  showStats?: boolean;
  onEventClick?: (event: ScheduleEvent) => void;
}

// Composant principal du grand calendrier refactorisé
const GrandCalendrier = ({
  events,
  title = "Emploi du temps",
  showStats = false,
  onEventClick,
}: BigCalendarProps) => {
  // État pour la vue actuelle du calendrier
  const [vue, setVue] = useState<View>(Views.WORK_WEEK);
  
  // État pour la modal de détails d'événement
  const [selectedEvent, setSelectedEvent] = useState<ScheduleEvent | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Gestionnaire pour le changement de vue
  const gererChangementVue = (vueSelectionnee: View) => {
    setVue(vueSelectionnee);
  };

  // Gestionnaire pour le clic sur un événement
  const gererClicEvenement = (event: ScheduleEvent) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
    
    if (onEventClick) {
      onEventClick(event);
    }
  };

  // Gestionnaire pour fermer la modal
  const fermerModal = () => {
    setIsModalOpen(false);
    setSelectedEvent(null);
  };

  // Heures de travail pour le calendrier
  const workingHours = useMemo(() => getWorkingHours(), []);

  // Configuration des propriétés des événements
  const eventPropGetter = (event: ScheduleEvent) => {
    const subjectColor = getSubjectColor(event.resource.subject);
    return {
      style: {
        backgroundColor: subjectColor.backgroundColor,
        borderColor: subjectColor.borderColor,
        color: subjectColor.textColor,
        borderRadius: '4px',
        border: 'none',
        fontSize: '12px',
      },
    };
  };

  // Messages en français
  const messages = {
    allDay: 'Toute la journée',
    previous: 'Précédent',
    next: 'Suivant',
    today: "Aujourd'hui",
    month: 'Mois',
    week: 'Semaine',
    day: 'Jour',
    agenda: 'Agenda',
    date: 'Date',
    time: 'Heure',
    event: 'Événement',
    noEventsInRange: 'Aucun cours dans cette période',
    showMore: (total: number) => `+${total} autres`,
  };

  return (
    <>
      <div className="h-full flex flex-col">
        {/* En-tête avec titre et statistiques */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
          {showStats && (
            <div className="flex gap-4 text-sm text-gray-600">
              <span>{events.length} cours</span>
              <span>{new Set(events.map(e => e.resource.subject)).size} matières</span>
            </div>
          )}
        </div>

        {/* Calendrier */}
        <div className="flex-1">
          <Calendar
            localizer={localisateur}
            events={events}
            startAccessor="start"
            endAccessor="end"
            views={["work_week", "day"]}
            view={vue}
            style={{ height: "100%" }}
            onView={gererChangementVue}
            onSelectEvent={gererClicEvenement}
            min={workingHours.min}
            max={workingHours.max}
            components={{
              event: vue === Views.DAY ? EventComponentDay : EventComponentWeek,
            }}
            eventPropGetter={eventPropGetter}
            messages={messages}
            step={30} // 30 minutes intervals
            timeslots={2} // 2 timeslots per hour
            showMultiDayTimes
            popup
          />
        </div>
      </div>

      {/* Modal de détails d'événement */}
      <EventDetailsModal
        event={selectedEvent}
        isOpen={isModalOpen}
        onClose={fermerModal}
      />
    </>
  );
};

export default GrandCalendrier;
