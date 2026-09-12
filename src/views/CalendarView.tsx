import React, { useState, useEffect } from 'react';
import { fetchCalendar } from '../lib/api';
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  Moon,
  Battery,
  X
} from 'lucide-react';

export const CalendarView: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarData, setCalendarData] = useState<{ [date: string]: any }>({});
  const [selectedDay, setSelectedDay] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;

  useEffect(() => {
    loadMonth();
  }, [year, month]);

  const loadMonth = async () => {
    setLoading(true);
    try {
      const data = await fetchCalendar(year, month);
      setCalendarData(data);
    } catch (err) {
      console.error('Failed to load calendar data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 2, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month, 1));
  };

  // Generate calendar grid
  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDayIndex = new Date(year, month - 1, 1).getDay(); // 0 = Sunday

  const daysArray = [];
  // Empty padding cells for previous month
  for (let i = 0; i < firstDayIndex; i++) {
    daysArray.push(null);
  }
  // Days of current month
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    daysArray.push({
      dayNumber: d,
      dateStr,
      data: calendarData[dateStr] || null
    });
  }

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div className="space-y-6 pb-16">
      {/* Calendar Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Consistency Calendar
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Daily logs, sleep metrics, and habit completion history
          </p>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1.5 rounded-xl shadow-xs self-start sm:self-auto">
          <button
            type="button"
            onClick={handlePrevMonth}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-bold text-slate-800 dark:text-slate-100 min-w-[120px] text-center">
            {monthNames[month - 1]} {year}
          </span>
          <button
            type="button"
            onClick={handleNextMonth}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Calendar Grid Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 sm:p-6 shadow-xs">
        {/* Day of week labels */}
        <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
          <span>Sun</span>
          <span>Mon</span>
          <span>Tue</span>
          <span>Wed</span>
          <span>Thu</span>
          <span>Fri</span>
          <span>Sat</span>
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 gap-2">
          {daysArray.map((cell, idx) => {
            if (!cell) {
              return <div key={`empty-${idx}`} className="h-20 sm:h-24 rounded-xl bg-slate-50/50 dark:bg-slate-950/20" />;
            }

            const dayData = cell.data;
            const completedCount = dayData?.completedHabits?.length || 0;
            const skippedCount = dayData?.skippedHabits?.length || 0;
            const total = completedCount + skippedCount;
            const isAllCompleted = total > 0 && skippedCount === 0;

            return (
              <div
                key={cell.dateStr}
                onClick={() => dayData && setSelectedDay(dayData)}
                className={`h-20 sm:h-24 p-2 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                  dayData
                    ? isAllCompleted
                      ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800 hover:border-emerald-400'
                      : skippedCount > 0
                      ? 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800 hover:border-amber-400'
                      : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 hover:border-slate-400'
                    : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800/60 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {cell.dayNumber}
                  </span>
                  {dayData && (
                    <span className="text-[10px] font-semibold text-slate-400">
                      {completedCount}/{total}
                    </span>
                  )}
                </div>

                {dayData ? (
                  <div className="space-y-1">
                    <div className="flex gap-1 flex-wrap">
                      {dayData.completedHabits.slice(0, 3).map((h: any, i: number) => (
                        <div
                          key={i}
                          title={h.habitName}
                          className="w-2 h-2 rounded-full bg-emerald-500"
                        />
                      ))}
                      {dayData.skippedHabits.slice(0, 2).map((h: any, i: number) => (
                        <div
                          key={`s-${i}`}
                          title={`Skipped: ${h.habitName}`}
                          className="w-2 h-2 rounded-full bg-rose-500"
                        />
                      ))}
                    </div>
                    {dayData.sleepHours && (
                      <span className="text-[9px] text-slate-400 block truncate">
                        {dayData.sleepHours}h sleep
                      </span>
                    )}
                  </div>
                ) : (
                  <div />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Day Drill-down Modal */}
      {selectedDay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  Daily Log Drill-Down
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">{selectedDay.date}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDay(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Context metrics */}
            <div className="grid grid-cols-3 gap-2 my-4">
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-center">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Energy</span>
                <span className="text-sm font-bold text-slate-800 dark:text-slate-100">{selectedDay.energy || 3} / 5</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-center">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Sleep</span>
                <span className="text-sm font-bold text-slate-800 dark:text-slate-100">{selectedDay.sleepHours || 7} hrs</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-center">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Mood</span>
                <span className="text-sm font-bold text-slate-800 dark:text-slate-100">
                  {selectedDay.mood === 5 ? '⚡ Great' : selectedDay.mood === 4 ? '🙂 Good' : '😐 OK'}
                </span>
              </div>
            </div>

            {/* Habits list */}
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {selectedDay.completedHabits.map((h: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-900/60 text-xs">
                  <span className="font-semibold text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    {h.habitName}
                  </span>
                  <span className="text-[10px] text-emerald-700 font-bold uppercase">Completed</span>
                </div>
              ))}

              {selectedDay.skippedHabits.map((h: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200/60 dark:border-rose-900/60 text-xs">
                  <div>
                    <span className="font-semibold text-rose-900 dark:text-rose-300 block">
                      {h.habitName}
                    </span>
                    <span className="text-[10px] text-rose-600 dark:text-rose-400">
                      Reason: {h.reason || 'Skipped'}
                    </span>
                  </div>
                  <span className="text-[10px] text-rose-700 font-bold uppercase">Skipped</span>
                </div>
              ))}
            </div>

            {selectedDay.notes && selectedDay.notes.length > 0 && (
              <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs text-slate-600 dark:text-slate-300">
                <span className="font-bold block text-slate-700 dark:text-slate-200 mb-1">Context note:</span>
                {selectedDay.notes[0]}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
