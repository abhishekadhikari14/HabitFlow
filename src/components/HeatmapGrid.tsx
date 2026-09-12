import React, { useState } from 'react';
import { HeatmapDay } from '../types';

interface HeatmapGridProps {
  days: HeatmapDay[];
  title?: string;
}

export const HeatmapGrid: React.FC<HeatmapGridProps> = ({
  days,
  title = 'Habit Consistency Heatmap'
}) => {
  const [hoveredDay, setHoveredDay] = useState<HeatmapDay | null>(null);

  // Group days into weeks (columns of 7 days)
  const weeks: HeatmapDay[][] = [];
  let currentWeek: HeatmapDay[] = [];

  for (let i = 0; i < days.length; i++) {
    currentWeek.push(days[i]);
    if (currentWeek.length === 7 || i === days.length - 1) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }

  const getIntensityColor = (intensity: number) => {
    switch (intensity) {
      case 4: return 'bg-emerald-600 dark:bg-emerald-500 border-emerald-700/30'; // >80%
      case 3: return 'bg-emerald-400 dark:bg-emerald-600/80 border-emerald-500/30'; // 60-80%
      case 2: return 'bg-emerald-200 dark:bg-emerald-800/60 border-emerald-300/30'; // 35-60%
      case 1: return 'bg-emerald-100 dark:bg-emerald-950 border-emerald-200/40'; // 1-35%
      default: return 'bg-slate-100 dark:bg-slate-800/80 border-slate-200/50 dark:border-slate-700/30'; // 0%
    }
  };

  const dayLabels = ['Sun', '', 'Tue', '', 'Thu', '', 'Sat'];

  return (
    <div id="habit-heatmap-container" className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <h3 className="font-bold text-slate-900 dark:text-white text-base">
            {title}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Last {days.length} days of daily execution intensity
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
          <span className="text-[11px]">Less</span>
          {[0, 1, 2, 3, 4].map(lvl => (
            <div
              key={lvl}
              className={`w-3 h-3 rounded-xs border ${getIntensityColor(lvl)}`}
            />
          ))}
          <span className="text-[11px]">More</span>
        </div>
      </div>

      {/* Grid */}
      <div className="overflow-x-auto pb-2">
        <div className="inline-flex gap-1.5 min-w-full">
          {/* Day of week labels */}
          <div className="flex flex-col justify-between text-[10px] text-slate-400 dark:text-slate-500 pr-1 select-none">
            {dayLabels.map((lbl, idx) => (
              <span key={idx} className="h-3 leading-3">
                {lbl}
              </span>
            ))}
          </div>

          {/* Weeks columns */}
          <div className="flex gap-1.5">
            {weeks.map((week, wIdx) => (
              <div key={wIdx} className="flex flex-col gap-1.5">
                {week.map((day) => (
                  <div
                    key={day.date}
                    onMouseEnter={() => setHoveredDay(day)}
                    onMouseLeave={() => setHoveredDay(null)}
                    className={`w-3.5 h-3.5 rounded-xs border cursor-pointer transition-transform hover:scale-125 ${getIntensityColor(
                      day.intensity
                    )}`}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Hover tooltip / info banner */}
      <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs min-h-[22px] flex items-center justify-between text-slate-600 dark:text-slate-300">
        {hoveredDay ? (
          <div>
            <strong className="text-slate-900 dark:text-white">{hoveredDay.date}</strong>: {hoveredDay.completionRate}% completion ({hoveredDay.completed} completed, {hoveredDay.missed} missed/skipped)
          </div>
        ) : (
          <span className="text-slate-400 text-[11px]">
            Hover over any square to view exact completion metrics for that date
          </span>
        )}
      </div>
    </div>
  );
};
