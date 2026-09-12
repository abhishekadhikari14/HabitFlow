import React from 'react';
import { Habit, AnalyticsOverview, DailyTrendPoint } from '../types';
import { ProgressRing } from '../components/ProgressRing';
import { StatCard } from '../components/StatCard';
import { ConsistencyScoreCard } from '../components/ConsistencyScoreCard';
import { HabitCard } from '../components/HabitCard';
import {
  Flame,
  TrendingUp,
  CheckCircle2,
  Brain,
  ArrowRight,
  Plus,
  Sparkles,
  Calendar,
  AlertTriangle
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip
} from 'recharts';

interface DashboardViewProps {
  habits: Habit[];
  overview: AnalyticsOverview | null;
  dailyTrend: DailyTrendPoint[];
  onCompleteHabit: (id: string, details?: any) => void;
  onSkipHabit: (id: string, details: any) => void;
  onUncompleteHabit: (id: string) => void;
  onEditHabit: (habit: Habit) => void;
  onDeleteHabit: (id: string) => void;
  onOpenNewHabit: () => void;
  onNavigateToTab: (tab: string) => void;
  onOpenAIChat: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  habits,
  overview,
  dailyTrend,
  onCompleteHabit,
  onSkipHabit,
  onUncompleteHabit,
  onEditHabit,
  onDeleteHabit,
  onOpenNewHabit,
  onNavigateToTab,
  onOpenAIChat
}) => {
  const completedTodayCount = habits.filter(h => h.todayLog?.status === 'completed').length;
  const totalTodayCount = habits.length;
  const todayProgressPercent = totalTodayCount > 0 ? (completedTodayCount / totalTodayCount) * 100 : 0;

  // Split habits by time of day
  const morningHabits = habits.filter(h => h.timeOfDay === 'morning');
  const afternoonHabits = habits.filter(h => h.timeOfDay === 'afternoon');
  const eveningHabits = habits.filter(h => h.timeOfDay === 'evening');

  return (
    <div className="space-y-6 pb-16">
      {/* Top Banner: Quick AI Behavioral Insight */}
      <div
        onClick={() => onNavigateToTab('ai_insights')}
        className="bg-gradient-to-r from-purple-900/10 via-purple-500/10 to-blue-500/10 dark:from-purple-950/40 dark:to-blue-950/30 border border-purple-200/80 dark:border-purple-800/60 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 cursor-pointer hover:border-purple-300 dark:hover:border-purple-700 transition-all shadow-xs"
      >
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-purple-700 dark:text-purple-300 uppercase tracking-wider">
                Behavioral Pattern Detected
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900/60 dark:text-purple-200 font-semibold">
                High Impact
              </span>
            </div>
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 mt-0.5">
              {overview?.energyCorrelation && overview.energyCorrelation.dropPercentage > 15
                ? `Low energy days (<3) drop your habit completion by ${overview.energyCorrelation.dropPercentage}%. Your primary blocker is "${overview?.topSkipReasons[0]?.reason || 'Fatigue'}".`
                : 'Your morning completion rate (80%) is significantly higher than evening routines.'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onNavigateToTab('ai_insights');
          }}
          className="self-end sm:self-auto text-xs font-bold text-purple-600 dark:text-purple-400 hover:text-purple-700 flex items-center gap-1 shrink-0"
        >
          View Full Analysis <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Today's Completion Card with Ring */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 tracking-wider uppercase">
              Today&apos;s Progress
            </span>
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white mt-2">
              {completedTodayCount} <span className="text-lg text-slate-400 font-normal">/ {totalTodayCount}</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {completedTodayCount === totalTodayCount && totalTodayCount > 0
                ? 'All habits completed! 🎉'
                : `${totalTodayCount - completedTodayCount} habits remaining`}
            </p>
          </div>
          <ProgressRing
            progress={todayProgressPercent}
            size={76}
            strokeWidth={7}
            label={`${Math.round(todayProgressPercent)}%`}
            color="#3b82f6"
          />
        </div>

        {/* Consistency Score Card */}
        {overview ? (
          <ConsistencyScoreCard scoreData={overview.consistencyScore} compact />
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 p-5 animate-pulse h-36" />
        )}

        {/* Current Active Streak */}
        <StatCard
          title="Current Streak"
          value={`${overview?.currentStreak || 0} Days`}
          subtitle={`Best streak: ${overview?.bestStreak || 0} days`}
          icon={Flame}
          iconColor="text-amber-500"
          iconBg="bg-amber-50 dark:bg-amber-950/40"
          trend={{ value: 'Active', isPositive: true }}
        />

        {/* 30-Day Completion Rate */}
        <StatCard
          title="30-Day Completion"
          value={`${overview?.overallCompletionRate || 0}%`}
          subtitle={overview?.strongestHabit ? `Strongest: ${overview.strongestHabit.name}` : 'No logs recorded yet'}
          icon={TrendingUp}
          iconColor="text-emerald-500"
          iconBg="bg-emerald-50 dark:bg-emerald-950/40"
          trend={{
            value: (overview?.overallCompletionRate || 0) > 0 ? `${overview?.overallCompletionRate}%` : 'Baseline',
            isPositive: (overview?.overallCompletionRate || 0) >= 70
          }}
        />
      </div>

      {/* Mini Trend Chart & Today's Schedule Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Today's Habits */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                Today&apos;s Habits
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Mark complete or log skip reasons with energy and sleep context
              </p>
            </div>

            <button
              type="button"
              onClick={onOpenNewHabit}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 flex items-center gap-1"
            >
              <Plus className="w-4 h-4" /> New Habit
            </button>
          </div>

          {habits.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 p-8 text-center">
              <p className="text-slate-500 text-sm">No habits active for today.</p>
              <button
                type="button"
                onClick={onOpenNewHabit}
                className="mt-3 px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-xl"
              >
                Create your first habit
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {habits.map(habit => (
                <HabitCard
                  key={habit.id}
                  habit={habit}
                  onComplete={onCompleteHabit}
                  onSkip={onSkipHabit}
                  onUncomplete={onUncompleteHabit}
                  onEdit={onEditHabit}
                  onDelete={onDeleteHabit}
                />
              ))}
            </div>
          )}
        </div>

        {/* Right 1 Col: 14-Day Consistency Trend & Quick Actions */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                14-Day Consistency Trend
              </h3>
              <button
                onClick={() => onNavigateToTab('analytics')}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-semibold"
              >
                Full Charts →
              </button>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Daily percentage of completed scheduled habits
            </p>

            <div className="h-40 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailyTrend} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="date"
                    tickFormatter={(val) => val.slice(5)}
                    stroke="#94a3b8"
                    fontSize={10}
                    tickLine={false}
                  />
                  <YAxis domain={[0, 100]} stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <Tooltip
                    formatter={(val: any) => [`${val}%`, 'Completion']}
                    labelFormatter={(label) => `Date: ${label}`}
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      borderRadius: '8px',
                      border: 'none',
                      color: '#fff',
                      fontSize: '11px'
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="rate"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#trendGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Quick Coach Q&A Box */}
          <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-md border border-slate-800">
            <div className="flex items-center gap-2 mb-2">
              <Brain className="w-4 h-4 text-purple-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-purple-300">
                HabitFlow Coach
              </span>
            </div>
            <h4 className="text-sm font-bold leading-snug">
              Have questions about your consistency?
            </h4>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Ask about your weak days, sleep correlation, or why your workouts drop off on Thursdays.
            </p>
            <button
              type="button"
              onClick={onOpenAIChat}
              className="mt-4 w-full py-2 px-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-colors shadow-xs flex items-center justify-center gap-1.5"
            >
              <Brain className="w-3.5 h-3.5" /> Ask HabitFlow Coach
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
