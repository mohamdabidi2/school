"use client";

import { ScheduleEvent, formatTime, formatDate } from "@/lib/scheduleUtils";
import { getSubjectColor } from "@/lib/scheduleUtils";
import Image from "next/image";

interface EventDetailsModalProps {
  event: ScheduleEvent | null;
  isOpen: boolean;
  onClose: () => void;
}

const EventDetailsModal = ({ event, isOpen, onClose }: EventDetailsModalProps) => {
  if (!isOpen || !event) return null;

  const subjectColor = getSubjectColor(event.resource.subject);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div 
          className="p-6 rounded-t-lg text-white"
          style={{ backgroundColor: subjectColor.borderColor }}
        >
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-bold">{event.resource.subject}</h2>
              <p className="text-sm opacity-90">{event.resource.class}</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Event Title */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Détails du cours</h3>
            <p className="text-gray-600">{event.title}</p>
          </div>

          {/* Time Information */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Image src="/time.png" alt="Heure" width={16} height={16} />
                <span className="text-sm font-medium text-gray-700">Heure de début</span>
              </div>
              <p className="text-lg font-semibold text-gray-800">
                {formatTime(event.start)}
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Image src="/time.png" alt="Heure" width={16} height={16} />
                <span className="text-sm font-medium text-gray-700">Heure de fin</span>
              </div>
              <p className="text-lg font-semibold text-gray-800">
                {formatTime(event.end)}
              </p>
            </div>
          </div>

          {/* Date Information */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Image src="/calendar.png" alt="Date" width={16} height={16} />
              <span className="text-sm font-medium text-gray-700">Date</span>
            </div>
            <p className="text-lg font-semibold text-gray-800">
              {formatDate(event.start)}
            </p>
          </div>

          {/* Teacher Information */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Image src="/teacher.png" alt="Enseignant" width={16} height={16} />
              <span className="text-sm font-medium text-gray-700">Enseignant</span>
            </div>
            <p className="text-lg font-semibold text-gray-800">
              {event.resource.teacher}
            </p>
          </div>

          {/* Subject Information */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Image src="/subject.png" alt="Matière" width={16} height={16} />
              <span className="text-sm font-medium text-gray-700">Matière</span>
            </div>
            <div className="flex items-center gap-3">
              <div 
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: subjectColor.borderColor }}
              />
              <p className="text-lg font-semibold text-gray-800">
                {event.resource.subject}
              </p>
            </div>
          </div>

          {/* Class Information */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Image src="/class.png" alt="Classe" width={16} height={16} />
              <span className="text-sm font-medium text-gray-700">Classe</span>
            </div>
            <p className="text-lg font-semibold text-gray-800">
              {event.resource.class}
            </p>
          </div>

          {/* Duration */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Image src="/duration.png" alt="Durée" width={16} height={16} />
              <span className="text-sm font-medium text-gray-700">Durée</span>
            </div>
            <p className="text-lg font-semibold text-gray-800">
              {Math.round((event.end.getTime() - event.start.getTime()) / (1000 * 60))} minutes
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200">
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Fermer
            </button>
            <button
              onClick={() => {
                // Add edit functionality here if needed
                console.log('Edit event:', event.id);
              }}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              Modifier
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetailsModal;
