import React, { useState } from 'react';
import { ConsistencyScoreBreakdown } from '../types';
import { ShieldCheck, Info, ChevronDown, ChevronUp, Zap } from 'lucide-react';

interface ConsistencyScoreCardProps {
  scoreData: ConsistencyScoreBreakdown;
  compact?: boolean;
}

export const ConsistencyScoreCard: React.FC<ConsistencyScoreCardProps> = ({ scoreData, compact = false }) => {
  const [showBreakdown, setShowBreakdown] = useState(false);

  // Determine badge color
  const getBadgeClass = (score: number) => {
    if (score === 0) return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
    if (score >= 80) return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800';
    if (score >= 65) return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800';
    if (score >= 50) return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800';
    return 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800';
  };

  return (
    <div id="consistency-score-card" className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs transition-all">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3 className="font-semibold text-slate-800 dark:text-slate-100 text-sm tracking-wide uppercase">
              Consistency Score
            </h3>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {scoreData.score}
            </span>
            <span className="text-slate-400 dark:text-slate-500 font-medium text-lg">
              / 100
            </span>
          </div>
        </div>

        <div className="flex flex-col items-end">
          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getBadgeClass(scoreData.score)}`}>
            {scoreData.levelLabel}
          </span>
          <button
            onClick={() => setShowBreakdown(!showBreakdown)}
            className="mt-2 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 flex items-center gap-1 font-medium transition-colors"
          >
            {showBreakdown ? (
              <>Hide Formula <ChevronUp className="w-3.5 h-3.5" /></>
            ) : (
              <>Explain Formula <ChevronDown className="w-3.5 h-3.5" /></>
            )}
          </button>
        </div>
      </div>

      <p className="mt-3 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
        {scoreData.description}
      </p>

      {/* Breakdown Drawer */}
      {showBreakdown && (
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
            <span className="font-semibold uppercase tracking-wider">Formula Breakdown</span>
            <span>Weighted Aggregate</span>
          </div>

          {/* Factor 1: 40% Completion Rate */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-slate-700 dark:text-slate-200">1. Completion Rate (40% weight)</span>
              <span className="text-slate-900 dark:text-white font-semibold">{scoreData.completionRateScore}/100</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${scoreData.completionRateScore}%` }}></div>
            </div>
          </div>

          {/* Factor 2: 20% Streak Stability */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-slate-700 dark:text-slate-200">2. Streak Stability (20% weight)</span>
              <span className="text-slate-900 dark:text-white font-semibold">{scoreData.streakStabilityScore}/100</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${scoreData.streakStabilityScore}%` }}></div>
            </div>
          </div>

          {/* Factor 3: 20% Routine Stability */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-slate-700 dark:text-slate-200">3. Routine Stability (20% weight)</span>
              <span className="text-slate-900 dark:text-white font-semibold">{scoreData.routineStabilityScore}/100</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div className="bg-purple-500 h-1.5 rounded-full" style={{ width: `${scoreData.routineStabilityScore}%` }}></div>
            </div>
          </div>

          {/* Factor 4: 10% Recovery Rate */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-slate-700 dark:text-slate-200">4. Recovery After Misses (10% weight)</span>
              <span className="text-slate-900 dark:text-white font-semibold">{scoreData.recoveryRateScore}/100</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: `${scoreData.recoveryRateScore}%` }}></div>
            </div>
          </div>

          {/* Factor 5: 10% Habit Adherence */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-slate-700 dark:text-slate-200">5. Priority Adherence (10% weight)</span>
              <span className="text-slate-900 dark:text-white font-semibold">{scoreData.habitAdherenceScore}/100</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div className="bg-cyan-500 h-1.5 rounded-full" style={{ width: `${scoreData.habitAdherenceScore}%` }}></div>
            </div>
          </div>

          <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl leading-relaxed flex items-start gap-1.5">
            <Info className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
            <span>
              <strong>Formula:</strong> Score = 0.40(Completion) + 0.20(Streak) + 0.20(Routine) + 0.10(Recovery) + 0.10(Priority Adherence). Avoids artificial streak inflation by evaluating recovery and daily dispersion.
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
