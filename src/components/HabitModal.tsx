import React, { useState, useEffect } from 'react';
import { Habit, Frequency, Difficulty, Priority } from '../types';
import { X, Check } from 'lucide-react';

interface HabitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (habitData: Partial<Habit>) => void;
  initialHabit?: Habit | null;
}

const CATEGORIES = [
  'Study',
  'Fitness',
  'Reading',
  'Meditation',
  'Health',
  'Sleep',
  'Productivity',
  'Career',
  'Mindset'
];

const COLORS = [
  '#3b82f6', // blue
  '#10b981', // emerald
  '#8b5cf6', // purple
  '#06b6d4', // cyan
  '#f59e0b', // amber
  '#ec4899', // pink
  '#ef4444', // red
  '#64748b'  // slate
];

const ICONS = [
  { name: 'BookOpen', label: 'Book' },
  { name: 'Activity', label: 'Fitness' },
  { name: 'Bookmark', label: 'Read' },
  { name: 'Smile', label: 'Zen' },
  { name: 'Droplet', label: 'Water' },
  { name: 'Moon', label: 'Sleep' },
  { name: 'Zap', label: 'Energy' }
];

export const HabitModal: React.FC<HabitModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialHabit
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Study');
  const [frequency, setFrequency] = useState<Frequency>('daily');
  const [target, setTarget] = useState(30);
  const [targetUnit, setTargetUnit] = useState('minutes');
  const [preferredTime, setPreferredTime] = useState('08:00');
  const [timeOfDay, setTimeOfDay] = useState<'morning' | 'afternoon' | 'evening'>('morning');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [priority, setPriority] = useState<Priority>('medium');
  const [color, setColor] = useState('#3b82f6');
  const [icon, setIcon] = useState('Activity');

  useEffect(() => {
    if (initialHabit) {
      setName(initialHabit.name || '');
      setDescription(initialHabit.description || '');
      setCategory(initialHabit.category || 'Study');
      setFrequency(initialHabit.frequency || 'daily');
      setTarget(initialHabit.target || 30);
      setTargetUnit(initialHabit.targetUnit || 'minutes');
      setPreferredTime(initialHabit.preferredTime || '08:00');
      setTimeOfDay(initialHabit.timeOfDay || 'morning');
      setDifficulty(initialHabit.difficulty || 'medium');
      setPriority(initialHabit.priority || 'medium');
      setColor(initialHabit.color || '#3b82f6');
      setIcon(initialHabit.icon || 'Activity');
    } else {
      setName('');
      setDescription('');
      setCategory('Study');
      setFrequency('daily');
      setTarget(30);
      setTargetUnit('minutes');
      setPreferredTime('08:00');
      setTimeOfDay('morning');
      setDifficulty('medium');
      setPriority('medium');
      setColor('#3b82f6');
      setIcon('Activity');
    }
  }, [initialHabit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    // determine timeOfDay from preferredTime if not set
    let computedTimeOfDay = timeOfDay;
    const hour = parseInt(preferredTime.split(':')[0], 10);
    if (!isNaN(hour)) {
      if (hour < 12) computedTimeOfDay = 'morning';
      else if (hour < 17) computedTimeOfDay = 'afternoon';
      else computedTimeOfDay = 'evening';
    }

    onSubmit({
      name: name.trim(),
      description: description.trim(),
      category,
      frequency,
      target: Number(target),
      targetUnit,
      preferredTime,
      timeOfDay: computedTimeOfDay,
      difficulty,
      priority,
      color,
      icon
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 overflow-y-auto max-h-[90vh]">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <h3 className="font-bold text-slate-900 dark:text-white text-lg">
            {initialHabit ? 'Edit Habit' : 'Create New Habit'}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Name & Category */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Habit Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Read 20 Pages, Study DSA, Morning Run"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Category
            </label>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                    category === cat
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-transparent font-semibold shadow-xs'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Target & Target Unit */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Target Value
              </label>
              <input
                type="number"
                min="1"
                value={target}
                onChange={e => setTarget(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Unit
              </label>
              <input
                type="text"
                placeholder="minutes, pages, glasses"
                value={targetUnit}
                onChange={e => setTargetUnit(e.target.value)}
                className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Preferred Time & Frequency */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Preferred Time
              </label>
              <input
                type="time"
                value={preferredTime}
                onChange={e => setPreferredTime(e.target.value)}
                className="w-full text-sm px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Frequency
              </label>
              <select
                value={frequency}
                onChange={e => setFrequency(e.target.value as Frequency)}
                className="w-full text-sm px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="daily">Daily</option>
                <option value="weekdays">Weekdays (Mon-Fri)</option>
                <option value="weekends">Weekends (Sat-Sun)</option>
              </select>
            </div>
          </div>

          {/* Difficulty & Priority */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Difficulty
              </label>
              <div className="flex gap-1">
                {(['easy', 'medium', 'hard'] as Difficulty[]).map(d => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDifficulty(d)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-semibold capitalize border transition-all ${
                      difficulty === d
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Priority
              </label>
              <div className="flex gap-1">
                {(['low', 'medium', 'high'] as Priority[]).map(p => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-semibold capitalize border transition-all ${
                      priority === p
                        ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Color & Icon */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Accent Color
            </label>
            <div className="flex items-center gap-2">
              {COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className="w-7 h-7 rounded-full transition-transform flex items-center justify-center text-white"
                  style={{ backgroundColor: c, transform: color === c ? 'scale(1.15)' : 'scale(1)' }}
                >
                  {color === c && <Check className="w-3.5 h-3.5" />}
                </button>
              ))}
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
              type="submit"
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
            >
              {initialHabit ? 'Save Changes' : 'Create Habit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
