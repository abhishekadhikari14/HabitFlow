import React, { useState, useEffect } from 'react';
import {
  AnalyticsOverview,
  DailyTrendPoint,
  HabitPerformanceItem,
  HeatmapDay
} from '../types';
import {
  fetchAnalyticsOverview,
  fetchDailyTrend,
  fetchHabitPerformance,
  fetchHeatmap
} from '../lib/api';
import { HeatmapGrid } from '../components/HeatmapGrid';
import { ConsistencyScoreCard } from '../components/ConsistencyScoreCard';
import { StatCard } from '../components/StatCard';
import {
  TrendingUp,
  Flame,
  Calendar,
  Sun,
  Moon,
  Battery,
  AlertCircle,
  HelpCircle,
  Clock
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell
} from 'recharts';

export const AnalyticsView: React.FC = () => {
  const [range, setRange] = useState<string>('30d');
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [dailyTrend, setDailyTrend] = useState<DailyTrendPoint[]>([]);
  const [performance, setPerformance] = useState<HabitPerformanceItem[]>([]);
  const [heatmap, setHeatmap] = useState<HeatmapDay[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [range]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [ov, trend, perf, heat] = await Promise.all([
        fetchAnalyticsOverview(range),
        fetchDailyTrend(range),
        fetchHabitPerformance(),
        fetchHeatmap(range === '90d' ? 90 : range === '6m' ? 180 : 84)
      ]);
      setOverview(ov);
      setDailyTrend(trend);
      setPerformance(perf);
      setHeatmap(heat);
    } catch (err) {
      console.error('Failed to load analytics data:', err);
    } finally {
      setLoading(false);
    }
  };

  const ranges = [
    { id: '7d', label: '7D' },
    { id: '30d', label: '30D' },
    { id: '90d', label: '90D' },
    { id: '6m', label: '6M' },
    { id: '1y', label: '1Y' }
  ];

  return (
    <div className="space-y-6 pb-16">
      {/* Header and Range Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Consistency Analytics
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Interactive behavioral telemetry, lifestyle correlations, and habit stability
          </p>
        </div>

        {/* Range Buttons */}
        <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1 rounded-xl shadow-xs self-start sm:self-auto">
          {ranges.map(r => (
            <button
              key={r.id}
              type="button"
              onClick={() => setRange(r.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                range === r.id
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Top 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Overall Completion"
          value={`${overview?.overallCompletionRate || 0}%`}
          subtitle={`Evaluated over ${range.toUpperCase()} period`}
          icon={TrendingUp}
          iconColor="text-blue-600 dark:text-blue-400"
          iconBg="bg-blue-50 dark:bg-blue-950/40"
        />

        {overview?.consistencyScore ? (
          <ConsistencyScoreCard scoreData={overview.consistencyScore} compact />
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border p-5 animate-pulse h-36" />
        )}

        <StatCard
          title="Active Streak"
          value={`${overview?.currentStreak || 0}d`}
          subtitle={`All-time best: ${overview?.bestStreak || 0} days`}
          icon={Flame}
          iconColor="text-amber-500"
          iconBg="bg-amber-50 dark:bg-amber-950/40"
        />

        <StatCard
          title="Routine Anchor"
          value={overview?.strongestHabit?.name ? overview.strongestHabit.name.split(' ')[0] : 'None'}
          subtitle={overview?.strongestHabit ? `Highest stability: ${overview.strongestHabit.rate}% rate` : 'Start logging to establish anchor'}
          icon={Calendar}
          iconColor="text-emerald-500"
          iconBg="bg-emerald-50 dark:bg-emerald-950/40"
        />
      </div>

      {/* Chart 1: Daily Completion Trend Line */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-4">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              Chart 1 — Daily Completion Trend ({range.toUpperCase()})
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Percentage of planned daily habits completed over time
            </p>
          </div>
          <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
            Average: {overview?.overallCompletionRate || 0}%
          </span>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={dailyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.6} />
              <XAxis
                dataKey="date"
                tickFormatter={(val) => val.slice(5)}
                stroke="#94a3b8"
                fontSize={11}
                tickLine={false}
              />
              <YAxis domain={[0, 100]} stroke="#94a3b8" fontSize={11} tickLine={false} />
              <Tooltip
                formatter={(val: any) => [`${val}%`, 'Completed']}
                labelFormatter={(label) => `Date: ${label}`}
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderRadius: '10px',
                  border: 'none',
                  color: '#fff',
                  fontSize: '12px'
                }}
              />
              <Line
                type="monotone"
                dataKey="rate"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={{ r: 3, fill: '#3b82f6' }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Grid of Chart 2 & Chart 3: Habit Performance & Day-of-Week Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 2: Habit Performance Comparison */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs">
          <h3 className="font-bold text-slate-900 dark:text-white text-base mb-1">
            Chart 2 — Habit Performance Comparison
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            Individual completion percentages across your tracked habits
          </p>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={performance}
                layout="vertical"
                margin={{ top: 5, right: 20, left: 40, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" opacity={0.5} />
                <XAxis type="number" domain={[0, 100]} stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis
                  type="category"
                  dataKey="name"
                  stroke="#94a3b8"
                  fontSize={10}
                  tickLine={false}
                  width={80}
                  tickFormatter={(val) => val.length > 12 ? `${val.slice(0, 12)}…` : val}
                />
                <Tooltip
                  formatter={(val: any) => [`${val}%`, 'Rate']}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '8px',
                    border: 'none',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                />
                <Bar dataKey="completionRate" radius={[0, 6, 6, 0]}>
                  {performance.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.completionRate >= 80 ? '#10b981' : entry.completionRate >= 60 ? '#3b82f6' : '#f59e0b'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Day-of-Week Distribution (identifying Thursday drop) */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs">
          <h3 className="font-bold text-slate-900 dark:text-white text-base mb-1">
            Chart 3 — Day of Week Distribution
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            Consistency by day of the week (pinpointing recurring weekly slump days)
          </p>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={overview?.dayOfWeekPatterns || []} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
                <XAxis
                  dataKey="day"
                  stroke="#94a3b8"
                  fontSize={10}
                  tickLine={false}
                  tickFormatter={(val) => val.slice(0, 3)}
                />
                <YAxis domain={[0, 100]} stroke="#94a3b8" fontSize={10} tickLine={false} />
                <Tooltip
                  formatter={(val: any) => [`${val}%`, 'Completion']}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '8px',
                    border: 'none',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                />
                <Bar dataKey="rate" radius={[6, 6, 0, 0]}>
                  {(overview?.dayOfWeekPatterns || []).map((entry, index) => (
                    <Cell
                      key={`day-${index}`}
                      fill={entry.rate < 65 ? '#ef4444' : entry.rate >= 85 ? '#10b981' : '#3b82f6'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Chart 4: Heatmap Grid */}
      <HeatmapGrid days={heatmap} />

      {/* Chart 5: Chronobiology & Lifestyle Correlations */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-xs space-y-6">
        <div>
          <h3 className="font-bold text-slate-900 dark:text-white text-base">
            Lifestyle & Chronobiology Correlations
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            How sleep hours, daily energy, and time-of-day directly dictate your consistency
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Time of Day */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 space-y-3">
            <div className="flex items-center gap-2">
              <Sun className="w-4 h-4 text-amber-500" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Morning vs. Evening
              </h4>
            </div>
            <div className="space-y-2">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span>Morning Habits</span>
                  <span className="font-bold text-emerald-600">{overview?.morningCompletionRate || 80}%</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${overview?.morningCompletionRate || 80}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span>Evening Habits</span>
                  <span className="font-bold text-blue-600">{overview?.eveningCompletionRate || 65}%</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${overview?.eveningCompletionRate || 65}%` }} />
                </div>
              </div>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
              Morning routines have higher cognitive stability before decision fatigue sets in.
            </p>
          </div>

          {/* Sleep Duration */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 space-y-3">
            <div className="flex items-center gap-2">
              <Moon className="w-4 h-4 text-indigo-500" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Sleep Duration Impact
              </h4>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">&lt; 6 hours sleep</span>
                <span className="font-bold text-rose-600">{overview?.sleepCorrelation.under6HoursRate || 68}% completion</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">6 - 8 hours sleep</span>
                <span className="font-bold text-emerald-600">{overview?.sleepCorrelation.between6and8HoursRate || 94}% completion</span>
              </div>
            </div>
            <div className="p-2 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-[11px] text-rose-700 dark:text-rose-400 border border-rose-200/60 dark:border-rose-900/60">
              <strong>-{overview?.sleepCorrelation.dropPercentage || 26}% drop</strong> in execution when sleeping under 6 hours.
            </div>
          </div>

          {/* Energy Level */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 space-y-3">
            <div className="flex items-center gap-2">
              <Battery className="w-4 h-4 text-emerald-500" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Energy Sensitivity
              </h4>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Low Energy (&lt;3/5)</span>
                <span className="font-bold text-rose-600">{overview?.energyCorrelation.lowEnergyRate || 68}% completion</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">High Energy (&ge;3/5)</span>
                <span className="font-bold text-emerald-600">{overview?.energyCorrelation.highEnergyRate || 94}% completion</span>
              </div>
            </div>
            <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-[11px] text-blue-700 dark:text-blue-400 border border-blue-200/60 dark:border-blue-900/60">
              <strong>Recommendation:</strong> Define micro-versions (5-10 min) for low energy evenings.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
