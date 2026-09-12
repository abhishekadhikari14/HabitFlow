import React, { useState, useEffect } from 'react';
import { Download, FileText, Calendar, CheckCircle2, TrendingUp, AlertTriangle, ArrowRight } from 'lucide-react';

export const ReportsView: React.FC = () => {
  const [reportType, setReportType] = useState<'weekly' | 'monthly'>('weekly');
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReport();
  }, [reportType]);

  const loadReport = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/reports/summary?type=${reportType}`);
      if (res.ok) {
        const data = await res.json();
        setReportData(data);
      }
    } catch (err) {
      console.error('Failed to load report:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    window.location.href = '/api/reports/export-csv';
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Habit Reports & Export
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Automated performance summaries and exportable historical data
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* Toggle Type */}
          <div className="flex bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1 rounded-xl shadow-xs">
            <button
              type="button"
              onClick={() => setReportType('weekly')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                reportType === 'weekly'
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
              }`}
            >
              Weekly Report
            </button>
            <button
              type="button"
              onClick={() => setReportType('monthly')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                reportType === 'monthly'
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
              }`}
            >
              Monthly Report
            </button>
          </div>

          {/* Export CSV button */}
          <button
            type="button"
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>

      {/* Main Report Card */}
      {reportData && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 gap-2">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                Official Executive Summary
              </span>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white capitalize">
                {reportData.type} Performance Audit
              </h3>
            </div>
            <span className="text-xs text-slate-400">
              Generated: {new Date(reportData.generatedAt).toLocaleDateString()}
            </span>
          </div>

          {/* Core Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
              <span className="text-xs text-slate-400 font-medium">Completion Rate</span>
              <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
                {reportData.completionRate}%
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
              <span className="text-xs text-slate-400 font-medium">Consistency Score</span>
              <div className="text-2xl font-extrabold text-blue-600 dark:text-blue-400 mt-1">
                {reportData.consistencyScore?.score} <span className="text-sm font-normal text-slate-400">/ 100</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
              <span className="text-xs text-slate-400 font-medium">Current Streak</span>
              <div className="text-2xl font-extrabold text-amber-500 mt-1">
                {reportData.currentStreak} Days
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
              <span className="text-xs text-slate-400 font-medium">Stability Level</span>
              <div className="text-base font-bold text-emerald-600 dark:text-emerald-400 mt-2">
                {reportData.consistencyScore?.levelLabel}
              </div>
            </div>
          </div>

          {/* Best vs Weakest Habit */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/40 dark:bg-emerald-950/20">
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                🌟 Anchor Habit (Highest Adherence)
              </span>
              <h4 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                {reportData.bestHabit?.name || 'Daily Hydration'}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {reportData.bestHabit?.rate || 100}% completion. Excellent automaticity established.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/40 dark:bg-rose-950/20">
              <span className="text-xs font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wider">
                ⚠️ Friction Point (Needs Attention)
              </span>
              <h4 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                {reportData.weakestHabit?.name || 'Morning Workout'}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {reportData.weakestHabit?.rate || 68}% completion. Correlates with low sleep and Thursday slumps.
              </p>
            </div>
          </div>

          {/* Action Plan for Next Period */}
          <div className="p-5 rounded-xl bg-slate-900 text-white space-y-2">
            <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">
              Recommended Action Plan
            </span>
            <p className="text-sm font-semibold text-slate-100">
              {reportData.recommendation}
            </p>
            <p className="text-xs text-slate-400 leading-relaxed">
              Top recorded obstacle was &ldquo;{reportData.topInconsistencyReason?.reason || 'Too tired'}&rdquo; accounting for {reportData.topInconsistencyReason?.percentage || 35}% of skips. Target micro-execution (10 min minimum) when fatigue strikes.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
