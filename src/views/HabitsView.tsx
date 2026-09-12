import React, { useState } from 'react';
import { Habit } from '../types';
import { HabitCard } from '../components/HabitCard';
import { Plus, Filter, Search, CheckCircle2, Clock } from 'lucide-react';

interface HabitsViewProps {
  habits: Habit[];
  onCompleteHabit: (id: string, details?: any) => void;
  onSkipHabit: (id: string, details: any) => void;
  onUncompleteHabit: (id: string) => void;
  onEditHabit: (habit: Habit) => void;
  onDeleteHabit: (id: string) => void;
  onOpenNewHabit: () => void;
}

export const HabitsView: React.FC<HabitsViewProps> = ({
  habits,
  onCompleteHabit,
  onSkipHabit,
  onUncompleteHabit,
  onEditHabit,
  onDeleteHabit,
  onOpenNewHabit
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedTime, setSelectedTime] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = ['All', ...Array.from(new Set(habits.map(h => h.category)))];

  const filteredHabits = habits.filter(h => {
    const matchesCat = selectedCategory === 'All' || h.category === selectedCategory;
    const matchesTime = selectedTime === 'All' || h.timeOfDay === selectedTime;
    const matchesSearch = h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          h.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesTime && matchesSearch;
  });

  return (
    <div className="space-y-6 pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            My Habits ({habits.length})
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Manage your daily routine, schedule preferences, and active streaks
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenNewHabit}
          className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs self-start sm:self-auto transition-colors"
        >
          <Plus className="w-4 h-4" /> Add New Habit
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search habits by name or category..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Time of day toggle */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl shrink-0">
            {['All', 'morning', 'afternoon', 'evening'].map(time => (
              <button
                key={time}
                type="button"
                onClick={() => setSelectedTime(time)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                  selectedTime === time
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
                }`}
              >
                {time}
              </button>
            ))}
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mr-1 shrink-0">
            Category:
          </span>
          {categories.map(cat => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-lg text-xs font-medium border whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-transparent font-semibold shadow-xs'
                  : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Habits Grid */}
      {filteredHabits.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 p-12 text-center">
          <p className="text-slate-500 text-sm">No habits match the selected filters.</p>
          <button
            type="button"
            onClick={() => {
              setSelectedCategory('All');
              setSelectedTime('All');
              setSearchQuery('');
            }}
            className="mt-2 text-xs font-semibold text-blue-600 hover:underline"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredHabits.map(habit => (
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
  );
};
