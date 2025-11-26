import { ScheduleEvent, getScheduleStats } from "@/lib/scheduleUtils";

interface ScheduleStatsProps {
  events: ScheduleEvent[];
  className?: string;
}

const ScheduleStats = ({ events, className = "" }: ScheduleStatsProps) => {
  const stats = getScheduleStats(events);

  return (
    <div className={`bg-white rounded-lg p-4 shadow-sm ${className}`}>
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Statistiques du Planning</h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{stats.totalLessons}</div>
          <div className="text-sm text-gray-600">Total Cours</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{stats.uniqueSubjects}</div>
          <div className="text-sm text-gray-600">Matières</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">{stats.uniqueClasses}</div>
          <div className="text-sm text-gray-600">Classes</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-orange-600">{stats.uniqueTeachers}</div>
          <div className="text-sm text-gray-600">Enseignants</div>
        </div>
      </div>

      {/* Répartition par jour */}
      <div>
        <h4 className="text-md font-semibold text-gray-700 mb-3">Répartition par jour</h4>
        <div className="space-y-2">
          {Object.entries(stats.lessonsByDay).map(([day, count]) => (
            <div key={day} className="flex items-center justify-between">
              <span className="text-sm text-gray-600 capitalize">{day}</span>
              <div className="flex items-center gap-2">
                <div className="w-20 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(count / Math.max(...Object.values(stats.lessonsByDay))) * 100}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-800 w-8 text-right">{count}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ScheduleStats;
