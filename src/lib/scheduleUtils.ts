import { Lesson, Subject, Class, Teacher } from "@prisma/client";

// Types for schedule data
export interface ScheduleEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: {
    teacher: string;
    subject: string;
    class: string;
    subjectId: number;
    classId: number;
    teacherId: string;
  };
  color?: string;
}

export interface ScheduleConfig {
  startHour: number;
  endHour: number;
  workingDays: number[];
  timeSlotDuration: number; // in minutes
}

// Default schedule configuration
export const DEFAULT_SCHEDULE_CONFIG: ScheduleConfig = {
  startHour: 8,
  endHour: 17,
  workingDays: [1, 2, 3, 4, 5], // Monday to Friday
  timeSlotDuration: 60, // 1 hour slots
};

// Color palette for different subjects
export const SUBJECT_COLORS = [
  { backgroundColor: '#E3F2FD', borderColor: '#2196F3', textColor: '#1976D2' },
  { backgroundColor: '#F3E5F5', borderColor: '#9C27B0', textColor: '#7B1FA2' },
  { backgroundColor: '#E8F5E8', borderColor: '#4CAF50', textColor: '#388E3C' },
  { backgroundColor: '#FFF3E0', borderColor: '#FF9800', textColor: '#F57C00' },
  { backgroundColor: '#FCE4EC', borderColor: '#E91E63', textColor: '#C2185B' },
  { backgroundColor: '#E0F2F1', borderColor: '#009688', textColor: '#00796B' },
  { backgroundColor: '#FFF8E1', borderColor: '#FFC107', textColor: '#FFA000' },
  { backgroundColor: '#F1F8E9', borderColor: '#8BC34A', textColor: '#689F38' },
];

// Get color for a subject based on its name
export const getSubjectColor = (subjectName: string): typeof SUBJECT_COLORS[0] => {
  const colorIndex = subjectName.length % SUBJECT_COLORS.length;
  return SUBJECT_COLORS[colorIndex];
};

// Transform lesson data to schedule events
export const transformLessonsToEvents = (
  lessons: (Lesson & { subject: Subject; class: Class; teacher: Teacher })[]
): ScheduleEvent[] => {
  return lessons.map((lesson) => ({
    id: lesson.id.toString(),
    title: `${lesson.subject.name} - ${lesson.class.name}`,
    start: lesson.startTime,
    end: lesson.endTime,
    resource: {
      teacher: `${lesson.teacher.name} ${lesson.teacher.surname}`,
      subject: lesson.subject.name,
      class: lesson.class.name,
      subjectId: lesson.subjectId,
      classId: lesson.classId,
      teacherId: lesson.teacherId,
    },
    color: getSubjectColor(lesson.subject.name).backgroundColor,
  }));
};

// Get the current week's Monday
export const getCurrentWeekMonday = (): Date => {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const daysSinceMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const monday = new Date(today);
  monday.setDate(today.getDate() - daysSinceMonday);
  monday.setHours(0, 0, 0, 0);
  return monday;
};

// Adjust schedule to current week
export const adjustScheduleToCurrentWeek = (
  events: ScheduleEvent[]
): ScheduleEvent[] => {
  const currentWeekMonday = getCurrentWeekMonday();

  return events.map((event) => {
    const eventDayOfWeek = event.start.getDay();
    const daysFromMonday = eventDayOfWeek === 0 ? 6 : eventDayOfWeek - 1;

    const adjustedStartDate = new Date(currentWeekMonday);
    adjustedStartDate.setDate(currentWeekMonday.getDate() + daysFromMonday);
    adjustedStartDate.setHours(
      event.start.getHours(),
      event.start.getMinutes(),
      event.start.getSeconds()
    );

    const adjustedEndDate = new Date(adjustedStartDate);
    adjustedEndDate.setHours(
      event.end.getHours(),
      event.end.getMinutes(),
      event.end.getSeconds()
    );

    return {
      ...event,
      start: adjustedStartDate,
      end: adjustedEndDate,
    };
  });
};

// Get schedule statistics
export const getScheduleStats = (events: ScheduleEvent[]) => {
  const totalLessons = events.length;
  const uniqueSubjects = new Set(events.map(e => e.resource.subject)).size;
  const uniqueClasses = new Set(events.map(e => e.resource.class)).size;
  const uniqueTeachers = new Set(events.map(e => e.resource.teacher)).size;

  // Group by day
  const lessonsByDay = events.reduce((acc, event) => {
    const day = event.start.toLocaleDateString('fr-FR', { weekday: 'long' });
    acc[day] = (acc[day] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return {
    totalLessons,
    uniqueSubjects,
    uniqueClasses,
    uniqueTeachers,
    lessonsByDay,
  };
};

// Filter events by date range
export const filterEventsByDateRange = (
  events: ScheduleEvent[],
  startDate: Date,
  endDate: Date
): ScheduleEvent[] => {
  return events.filter(event => {
    const eventDate = new Date(event.start);
    return eventDate >= startDate && eventDate <= endDate;
  });
};

// Get events for a specific day
export const getEventsForDay = (
  events: ScheduleEvent[],
  targetDate: Date
): ScheduleEvent[] => {
  const startOfDay = new Date(targetDate);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(targetDate);
  endOfDay.setHours(23, 59, 59, 999);

  return filterEventsByDateRange(events, startOfDay, endOfDay);
};

// Format time for display
export const formatTime = (date: Date): string => {
  return date.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Format date for display
export const formatDate = (date: Date): string => {
  return date.toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

// Get working hours for calendar
export const getWorkingHours = (config: ScheduleConfig = DEFAULT_SCHEDULE_CONFIG) => {
  const today = new Date();
  return {
    min: new Date(today.getFullYear(), today.getMonth(), today.getDate(), config.startHour, 0, 0),
    max: new Date(today.getFullYear(), today.getMonth(), today.getDate(), config.endHour, 0, 0),
  };
};
