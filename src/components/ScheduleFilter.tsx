"use client";

import { useState, useEffect } from "react";
import { ScheduleEvent, filterEventsByDateRange, getEventsForDay } from "@/lib/scheduleUtils";

interface ScheduleFilterProps {
  events: ScheduleEvent[];
  onFilteredEvents: (events: ScheduleEvent[]) => void;
  className?: string;
}

const ScheduleFilter = ({ events, onFilteredEvents, className = "" }: ScheduleFilterProps) => {
  const [filterType, setFilterType] = useState<'all' | 'today' | 'week' | 'custom'>('all');
  const [customDate, setCustomDate] = useState(new Date().toISOString().split('T')[0]);
  const [subjectFilter, setSubjectFilter] = useState<string>('all');

  // Get unique subjects
  const subjects = Array.from(new Set(events.map(e => e.resource.subject)));

  useEffect(() => {
    let filteredEvents = [...events];

    // Apply date filter
    switch (filterType) {
      case 'today':
        filteredEvents = getEventsForDay(events, new Date());
        break;
      case 'week':
        const startOfWeek = new Date();
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay() + 1);
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        filteredEvents = filterEventsByDateRange(events, startOfWeek, endOfWeek);
        break;
      case 'custom':
        const customDateObj = new Date(customDate);
        filteredEvents = getEventsForDay(events, customDateObj);
        break;
      default:
        // 'all' - no date filtering
        break;
    }

    // Apply subject filter
    if (subjectFilter !== 'all') {
      filteredEvents = filteredEvents.filter(e => e.resource.subject === subjectFilter);
    }

    onFilteredEvents(filteredEvents);
  }, [events, filterType, customDate, subjectFilter, onFilteredEvents]);

  return (
    <div className={`bg-white rounded-lg p-4 shadow-sm ${className}`}>
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Filtres</h3>
      
      <div className="space-y-4">
        {/* Date Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Période</label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                filterType === 'all'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Tous
            </button>
            <button
              onClick={() => setFilterType('today')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                filterType === 'today'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Aujourd&apos;hui
            </button>
            <button
              onClick={() => setFilterType('week')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                filterType === 'week'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Cette semaine
            </button>
            <button
              onClick={() => setFilterType('custom')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                filterType === 'custom'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Date spécifique
            </button>
          </div>
          {filterType === 'custom' && (
            <input
              type="date"
              value={customDate}
              onChange={(e) => setCustomDate(e.target.value)}
              className="mt-2 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          )}
        </div>

        {/* Subject Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Matière</label>
          <select
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Toutes les matières</option>
            {subjects.map(subject => (
              <option key={subject} value={subject}>{subject}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default ScheduleFilter;
