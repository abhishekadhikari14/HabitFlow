import React, { useState } from 'react';
import { Habit } from '../types';
import { Check, ArrowRight, Sparkles, Clock, Target, Shield, Flame } from 'lucide-react';

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: (firstHabitData?: Partial<Habit>) => void;
}

const FOCUS_AREAS = [
  'Fitness',
  'Study',
  'Career',
  'Health',
  'Sleep',
  'Reading',
  'Productivity',
  'Meditation',
  'Personal growth'
];

const OBSTACLES = [
  'Lack of time',
  'Forgetfulness',
  'Low motivation',
  'Poor sleep',
  'Stress',
  'Too many tasks',
  'Habit is too difficult',
  'No clear routine',
  'Distractions'
];

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onComplete }) => {
  const [step, setStep] = useState(1);
  const [selectedAreas, setSelectedAreas] = useState<string[]>(['Study', 'Fitness']);
  const [selectedObstacles, setSelectedObstacles] = useState<string[]>(['Lack of time', 'Low motivation']);
  const [reminderTime, setReminderTime] = useState('08:00');

  // Screen 5 first habit
  const [firstHabitName, setFirstHabitName] = useState('Study DSA & System Design');
  const [firstHabitTarget, setFirstHabitTarget] = useState(45);
  const [firstHabitUnit, setFirstHabitUnit] = useState('minutes');

  if (!isOpen) return null;

  const toggleArea = (area: string) => {
    if (selectedAreas.includes(area)) {
      setSelectedAreas(selectedAreas.filter(a => a !== area));
    } else {
      setSelectedAreas([...selectedAreas, area]);
    }
  };

  const toggleObstacle = (obs: string) => {
    if (selectedObstacles.includes(obs)) {
      setSelectedObstacles(selectedObstacles.filter(o => o !== obs));
    } else {
      setSelectedObstacles([...selectedObstacles, obs]);
    }
  };

  const handleFinish = () => {
    onComplete({
      name: firstHabitName.trim() || 'Daily Focus Habit',
      category: selectedAreas[0] || 'Study',
      target: firstHabitTarget,
      targetUnit: firstHabitUnit,
      frequency: 'daily',
      preferredTime: reminderTime,
      difficulty: 'medium',
      priority: 'high',
      color: '#3b82f6',
      icon: 'BookOpen'
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 flex flex-col justify-between min-h-[500px]">
        {/* Progress indicator */}
        <div className="flex items-center justify-between mb-6">
          <span className="text-xs font-bold text-blue-600 dark:text-blue-400 tracking-wider uppercase">
            Step {step} of 5
          </span>
          <div className="flex gap-1.5">
            {[1, 2, 3, 4, 5].map(s => (
              <div
                key={s}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  s === step
                    ? 'w-6 bg-blue-600'
                    : s < step
                    ? 'w-3 bg-blue-300 dark:bg-blue-900'
                    : 'w-2 bg-slate-200 dark:bg-slate-800'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Screen 1: Welcome */}
        {step === 1 && (
          <div className="flex-1 flex flex-col justify-center text-center py-4">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 mx-auto flex items-center justify-center mb-6 border border-blue-200/50 dark:border-blue-800/50 shadow-xs">
              <Flame className="w-8 h-8 fill-blue-500 text-blue-500" />
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
              Build consistency, not perfection.
            </h2>
            <p className="mt-4 text-sm text-slate-600 dark:text-slate-300 max-w-sm mx-auto leading-relaxed">
              HabitFlow AI is an intelligent behavioral tracker that reveals <em>why</em> you become inconsistent and provides evidence-backed adjustments.
            </p>
          </div>
        )}

        {/* Screen 2: Focus Areas */}
        {step === 2 && (
          <div className="flex-1 py-2">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              What areas do you want to improve?
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
              Select one or more categories you want to focus on:
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {FOCUS_AREAS.map(area => {
                const isSelected = selectedAreas.includes(area);
                return (
                  <button
                    key={area}
                    type="button"
                    onClick={() => toggleArea(area)}
                    className={`p-3 rounded-xl text-xs font-semibold border transition-all text-left flex items-center justify-between ${
                      isSelected
                        ? 'bg-blue-50 dark:bg-blue-950/50 border-blue-500 text-blue-700 dark:text-blue-300 ring-2 ring-blue-500/20'
                        : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span>{area}</span>
                    {isSelected && <Check className="w-4 h-4 text-blue-600" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Screen 3: Inconsistency Blockers */}
        {step === 3 && (
          <div className="flex-1 py-2">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              What usually prevents you from completing habits?
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
              Our AI engine will monitor these specific friction points:
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              {OBSTACLES.map(obs => {
                const isSelected = selectedObstacles.includes(obs);
                return (
                  <button
                    key={obs}
                    type="button"
                    onClick={() => toggleObstacle(obs)}
                    className={`p-3 rounded-xl text-xs font-semibold border transition-all text-left flex items-center justify-between ${
                      isSelected
                        ? 'bg-purple-50 dark:bg-purple-950/50 border-purple-500 text-purple-700 dark:text-purple-300 ring-2 ring-purple-500/20'
                        : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span>{obs}</span>
                    {isSelected && <Check className="w-4 h-4 text-purple-600" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Screen 4: Reminder Time */}
        {step === 4 && (
          <div className="flex-1 flex flex-col justify-center py-2">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center mb-4 mx-auto">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white text-center mb-2">
              When should we remind you?
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 text-center mb-6 max-w-xs mx-auto">
              Choose your ideal daily check-in time for reviewing progress and logging context:
            </p>
            <div className="max-w-xs mx-auto w-full">
              <input
                type="time"
                value={reminderTime}
                onChange={e => setReminderTime(e.target.value)}
                className="w-full text-center text-2xl font-bold py-3 px-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        )}

        {/* Screen 5: First Habit */}
        {step === 5 && (
          <div className="flex-1 py-2">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              Create your foundational habit
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
              Start with one clear, measurable action to kick off your streak:
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Habit Name
                </label>
                <input
                  type="text"
                  value={firstHabitName}
                  onChange={e => setFirstHabitName(e.target.value)}
                  className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Daily Target
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={firstHabitTarget}
                    onChange={e => setFirstHabitTarget(parseInt(e.target.value) || 1)}
                    className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Unit
                  </label>
                  <input
                    type="text"
                    value={firstHabitUnit}
                    onChange={e => setFirstHabitUnit(e.target.value)}
                    className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer controls */}
        <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
            >
              Back
            </button>
          ) : (
            <div />
          )}

          {step < 5 ? (
            <button
              type="button"
              onClick={() => setStep(step + 1)}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-colors"
            >
              Continue <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinish}
              className="px-6 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-colors"
            >
              Enter HabitFlow <Sparkles className="w-4 h-4 text-blue-500" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
