import React, { useState } from 'react';
import { Habit } from '../types';
import confetti from 'canvas-confetti';
import {
  Check,
  Flame,
  Clock,
  MoreVertical,
  Edit2,
  Trash2,
  BookOpen,
  Activity,
  Bookmark,
  Smile,
  Droplet,
  Moon,
  Zap,
  CheckCircle2,
  RotateCcw,
  SkipForward
} from 'lucide-react';
import { SkipModal } from './SkipModal';

interface HabitCardProps {
  habit: Habit;
  onComplete: (id: string, details?: any) => void;
  onSkip: (id: string, details: any) => void;
  onUncomplete: (id: string) => void;
  onEdit: (habit: Habit) => void;
  onDelete: (id: string) => void;
}

export const HabitCard: React.FC<HabitCardProps> = ({
  habit,
  onComplete,
  onSkip,
  onUncomplete,
  onEdit,
  onDelete
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showSkipModal, setShowSkipModal] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);

  const isCompletedToday = habit.todayLog?.status === 'completed';
  const isSkippedToday = habit.todayLog?.status === 'skipped' || habit.todayLog?.status === 'missed';

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6']
      });
    } catch (e) {
      // safe fallback
    }
  };

  const handleCompleteClick = () => {
    if (isCompletedToday) {
      onUncomplete(habit.id);
    } else {
      setIsCompleting(true);
      triggerConfetti();
      onComplete(habit.id);
      setTimeout(() => setIsCompleting(false), 500);
    }
  };

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'BookOpen': return <BookOpen className="w-5 h-5" />;
      case 'Activity': return <Activity className="w-5 h-5" />;
      case 'Bookmark': return <Bookmark className="w-5 h-5" />;
      case 'Smile': return <Smile className="w-5 h-5" />;
      case 'Droplet': return <Droplet className="w-5 h-5" />;
      case 'Moon': return <Moon className="w-5 h-5" />;
      default: return <Zap className="w-5 h-5" />;
    }
  };

  return (
    <div
      id={`habit-card-${habit.id}`}
      className={`relative rounded-2xl border transition-all duration-200 p-4 sm:p-5 flex flex-col justify-between ${
        isCompletedToday
          ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/60 shadow-xs'
          : isSkippedToday
          ? 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 opacity-80'
          : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-xs'
      }`}
    >
      <div>
        {/* Header row with Icon, Category, Streak and Options */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-xs shrink-0"
              style={{ backgroundColor: habit.color || '#3b82f6' }}
            >
              {getIcon(habit.icon)}
            </div>

            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                {habit.category}
              </span>
              <h4 className={`font-bold text-base leading-snug ${
                isCompletedToday
                  ? 'text-slate-900 dark:text-slate-100 line-through decoration-emerald-500/50'
                  : 'text-slate-900 dark:text-white'
              }`}>
                {habit.name}
              </h4>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {/* Streak indicator */}
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/80 text-amber-700 dark:text-amber-400 text-xs font-bold">
              <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
              <span>{habit.streak || 0}d</span>
            </div>

            {/* Menu trigger */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowMenu(!showMenu)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                aria-label="Habit options"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {showMenu && (
                <>
                  <div
                    className="fixed inset-0 z-20"
                    onClick={() => setShowMenu(false)}
                  />
                  <div className="absolute right-0 mt-1 w-36 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 py-1 z-30 text-xs">
                    <button
                      type="button"
                      onClick={() => {
                        setShowMenu(false);
                        onEdit(habit);
                      }}
                      className="w-full text-left px-3 py-2 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 flex items-center gap-2"
                    >
                      <Edit2 className="w-3.5 h-3.5" /> Edit Habit
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowMenu(false);
                        onDelete(habit.id);
                      }}
                      className="w-full text-left px-3 py-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center gap-2"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Target details and scheduled time */}
        <div className="mt-3 flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
          <span className="font-semibold text-slate-700 dark:text-slate-300">
            Target: {habit.target} {habit.targetUnit}
          </span>
          {habit.preferredTime && (
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-400" />
              {habit.preferredTime}
            </span>
          )}
          <span className={`px-1.5 py-0.5 rounded-sm text-[10px] uppercase font-bold tracking-wider ${
            habit.difficulty === 'hard'
              ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300'
              : habit.difficulty === 'easy'
              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
              : 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300'
          }`}>
            {habit.difficulty}
          </span>
        </div>

        {/* Skipped reason label if skipped */}
        {isSkippedToday && habit.todayLog?.skipReason && (
          <div className="mt-2 text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 px-2.5 py-1 rounded-lg border border-amber-200 dark:border-amber-900/50">
            Skipped today: <strong>{habit.todayLog.skipReason}</strong>
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-2">
        {isCompletedToday ? (
          <button
            type="button"
            onClick={handleCompleteClick}
            className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-xs hover:bg-emerald-700 transition-colors"
          >
            <CheckCircle2 className="w-4 h-4" />
            Completed Today
          </button>
        ) : (
          <>
            <button
              type="button"
              onClick={handleCompleteClick}
              disabled={isCompleting}
              className={`flex-1 py-2 px-3 rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 transition-all ${
                isCompleting
                  ? 'bg-emerald-500 text-white scale-98'
                  : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 shadow-xs'
              }`}
            >
              <Check className="w-4 h-4" />
              Complete
            </button>

            {!isSkippedToday && (
              <button
                type="button"
                onClick={() => setShowSkipModal(true)}
                className="py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold text-xs flex items-center gap-1 transition-colors"
                title="Log skip with reason"
              >
                <SkipForward className="w-3.5 h-3.5 text-slate-400" />
                Skip
              </button>
            )}
          </>
        )}

        {(isCompletedToday || isSkippedToday) && (
          <button
            type="button"
            onClick={() => onUncomplete(habit.id)}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Reset today's status"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <SkipModal
        habit={habit}
        isOpen={showSkipModal}
        onClose={() => setShowSkipModal(false)}
        onSubmit={(details) => onSkip(habit.id, details)}
      />
    </div>
  );
};
