import React, { useState, useEffect } from 'react';
import { AIInsight, AnalyticsOverview } from '../types';
import { fetchAIInsights, fetchAnalyticsOverview } from '../lib/api';
import {
  Brain,
  Sparkles,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  MessageSquare,
  ShieldCheck,
  Zap,
  Lightbulb,
  CheckCircle2,
  Clock
} from 'lucide-react';

interface AIInsightsViewProps {
  onOpenAIChatWithPrompt: (prompt?: string) => void;
}

export const AIInsightsView: React.FC<AIInsightsViewProps> = ({ onOpenAIChatWithPrompt }) => {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInsights();
  }, []);

  const loadInsights = async () => {
    setLoading(true);
    try {
      const [aiData, ov] = await Promise.all([
        fetchAIInsights(),
        fetchAnalyticsOverview('30d')
      ]);
      setInsights(aiData);
      setOverview(ov);
    } catch (err) {
      console.error('Failed to load AI insights:', err);
    } finally {
      setLoading(false);
    }
  };

  const getBadgeStyle = (badge: string) => {
    switch (badge) {
      case 'Pattern detected':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800';
      case 'High Impact':
      case 'Routine Bottleneck':
        return 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800';
      case 'Strength':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      default:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800';
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-purple-950 text-white rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden border border-slate-800">
        <div className="max-w-2xl relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-400/30 text-xs font-semibold mb-3">
            <Brain className="w-3.5 h-3.5" />
            <span>Root-Cause Behavioral Engine</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Why am I losing consistency?
          </h2>
          <p className="mt-2 text-sm text-slate-300 leading-relaxed">
            HabitFlow AI continuously scans your log timestamps, sleep hours, skip feedback, and weekly momentum to uncover the genuine behavioral friction holding you back.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => onOpenAIChatWithPrompt('Why am I losing my streak?')}
              className="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-2 transition-colors"
            >
              <MessageSquare className="w-4 h-4" /> Ask HabitFlow Coach
            </button>
            <button
              type="button"
              onClick={() => onOpenAIChatWithPrompt('What habit should I change first?')}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl backdrop-blur-xs transition-colors"
            >
              &ldquo;What habit should I change first?&rdquo;
            </button>
          </div>
        </div>

        {/* Ambient subtle decorative shape */}
        <div className="absolute right-0 bottom-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Primary Inconsistency Blockers Ranked */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-4">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              Biggest Inconsistency Blockers
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Aggregated reasons recorded during habit skips and missed intervals
            </p>
          </div>
          <span className="text-xs font-medium text-slate-400">
            Last 30 Days Telemetry
          </span>
        </div>

        <div className="space-y-3">
          {overview?.topSkipReasons.map((item, idx) => (
            <div key={item.reason} className="space-y-1">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-slate-800 dark:text-slate-200 font-semibold">
                  {idx + 1}. {item.reason} ({item.count} occurrences)
                </span>
                <span className="text-slate-900 dark:text-white font-bold">
                  {item.percentage}% of skips
                </span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                <div
                  className={`h-2.5 rounded-full ${
                    idx === 0 ? 'bg-rose-500' : idx === 1 ? 'bg-amber-500' : 'bg-blue-500'
                  }`}
                  style={{ width: `${item.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Behavioral Insights Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
            Grounded Behavioral Observations
          </h3>
          <span className="text-xs text-slate-400 font-medium">
            Evidence-backed recommendations
          </span>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 p-6 animate-pulse h-48" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {insights.map(item => (
              <div
                key={item.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-xs flex flex-col justify-between space-y-4 hover:border-slate-300 dark:hover:border-slate-700 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getBadgeStyle(item.badge)}`}>
                      {item.badge}
                    </span>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      {item.category}
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                    {item.title}
                  </h4>

                  {/* Evidence pill */}
                  <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3 border border-slate-200/60 dark:border-slate-700/60 space-y-1.5 mb-3">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-blue-500" /> Evidence in your data:
                    </div>
                    <p className="text-xs text-slate-800 dark:text-slate-200 font-medium">
                      &ldquo;{item.evidence}&rdquo;
                    </p>
                  </div>

                  {/* Behavioral Friction */}
                  <div className="space-y-1 mb-3">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-500" /> Possible Root Cause:
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {item.possibleReason}
                    </p>
                  </div>

                  {/* Actionable Micro-Recommendation */}
                  <div className="space-y-1">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <Lightbulb className="w-3.5 h-3.5" /> Recommended Adjustment:
                    </div>
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 bg-emerald-50/60 dark:bg-emerald-950/30 p-2.5 rounded-xl border border-emerald-200/60 dark:border-emerald-900/40">
                      {item.actionableRecommendation}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] font-medium text-slate-400">
                    Impact Potential: <strong className="text-slate-700 dark:text-slate-200">{item.impactScore}/10</strong>
                  </span>
                  <button
                    type="button"
                    onClick={() => onOpenAIChatWithPrompt(`Tell me more about this insight: "${item.title}". How can I implement the recommended fix?`)}
                    className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 flex items-center gap-1"
                  >
                    Discuss with Coach <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
