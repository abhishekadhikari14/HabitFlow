import React, { useState } from 'react';
import { Habit, SkipReason } from '../types';
import { X, HelpCircle, Battery, Moon, Sparkles } from 'lucide-react';

interface SkipModalProps {
  habit: Habit;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (details: {
    skipReason: SkipReason;
    mood?: number;
    energy?: number;
    sleepHours?: number;
    note?: string;
  }) => void;
}

const REASONS: SkipReason[] = [
  'No time',
  'Too tired',
  'Forgot',
  'Low motivation',
  'Busy',
  'Not feeling well',
  'Habit was too difficult',
  'Unexpected event',
  'Distraction',
  'Other'
];

export const SkipModal: React.FC<SkipModalProps> = ({ habit, isOpen, onClose, onSubmit }) => {
  const [selectedReason, setSelectedReason] = useState<SkipReason>('Too tired');
  const [energy, setEnergy] = useState<number>(3);
  const [mood, setMood] = useState<number>(3);
  const [sleepHours, setSleepHours] = useState<number>(7);
  const [note, setNote] = useState<string>('');

  if (!isOpen) return null;

  const handleConfirm = () => {
    onSubmit({
      skipReason: selectedReason,
      energy,
      mood,
      sleepHours,
      note: note.trim() ? note.trim() : undefined
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 overflow-y-auto max-h-[90vh]">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-lg">
              Log Skip / Rest
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              for &ldquo;{habit.name}&rdquo;
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 space-y-4">
          {/* Reason selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-blue-500" />
              Why didn't you complete this habit?
            </label>
            <div className="grid grid-cols-2 gap-2">
              {REASONS.map(reason => (
                <button
                  key={reason}
                  type="button"
                  onClick={() => setSelectedReason(reason)}
                  className={`text-left px-3 py-2 rounded-xl text-xs font-medium border transition-all ${
                    selectedReason === reason
                      ? 'bg-blue-50 dark:bg-blue-950/50 border-blue-500 text-blue-700 dark:text-blue-300 ring-2 ring-blue-500/20'
                      : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  {reason}
                </button>
              ))}
            </div>
          </div>

          {/* Energy level */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Battery className="w-3.5 h-3.5 text-amber-500" />
                Energy Level (1-5)
              </label>
              <span className="text-xs font-bold text-slate-900 dark:text-white">{energy} / 5</span>
            </div>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map(lvl => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setEnergy(lvl)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                    energy === lvl
                      ? 'bg-amber-500 text-white border-amber-600'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          {/* Sleep hours */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Moon className="w-3.5 h-3.5 text-indigo-500" />
                Sleep Duration (last night)
              </label>
              <span className="text-xs font-bold text-slate-900 dark:text-white">{sleepHours} hrs</span>
            </div>
            <input
              type="range"
              min="3"
              max="12"
              step="0.5"
              value={sleepHours}
              onChange={e => setSleepHours(parseFloat(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer"
            />
          </div>

          {/* Mood 1-5 */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                Mood
              </label>
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                {mood === 1 ? '😔 Depleted' : mood === 2 ? '😕 Low' : mood === 3 ? '😐 Neutral' : mood === 4 ? '🙂 Good' : '⚡ Energized'}
              </span>
            </div>
            <div className="flex gap-2">
              {[
                { val: 1, label: '😔' },
                { val: 2, label: '😕' },
                { val: 3, label: '😐' },
                { val: 4, label: '🙂' },
                { val: 5, label: '⚡' }
              ].map(item => (
                <button
                  key={item.val}
                  type="button"
                  onClick={() => setMood(item.val)}
                  className={`flex-1 py-1.5 rounded-lg text-base border transition-all ${
                    mood === item.val
                      ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-500 ring-2 ring-blue-500/30'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Optional notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Quick context (optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Back-to-back work meetings..."
              value={note}
              onChange={e => setNote(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-semibold rounded-xl hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors shadow-xs"
          >
            Save Reason & Log
          </button>
        </div>
      </div>
    </div>
  );
};
