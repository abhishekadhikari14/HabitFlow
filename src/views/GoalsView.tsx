import React, { useState, useEffect } from 'react';
import { Goal, Habit } from '../types';
import { fetchGoals, createGoal, updateGoal, deleteGoal, fetchHabits } from '../lib/api';
import { Target, Plus, Award, Calendar, CheckCircle2, Trash2, X } from 'lucide-react';

export const GoalsView: React.FC = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [targetDays, setTargetDays] = useState(30);
  const [selectedHabitId, setSelectedHabitId] = useState('');
  const [reward, setReward] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [g, h] = await Promise.all([fetchGoals(), fetchHabits()]);
      setGoals(g);
      setHabits(h);
      if (h.length > 0) setSelectedHabitId(h[0].id);
    } catch (err) {
      console.error('Failed to load goals:', err);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      const created = await createGoal({
        name: name.trim(),
        habitId: selectedHabitId || undefined,
        targetDays: Number(targetDays),
        reward: reward.trim() || undefined
      });
      setGoals([...goals, created]);
      setName('');
      setReward('');
      setShowAddModal(false);
    } catch (err) {
      console.error('Failed to create goal:', err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteGoal(id);
      setGoals(goals.filter(g => g.id !== id));
    } catch (err) {
      console.error('Failed to delete goal:', err);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Milestone Goals
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Commit to structured behavioral targets and earn custom milestone rewards
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs self-start sm:self-auto transition-colors"
        >
          <Plus className="w-4 h-4" /> New Milestone
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {goals.map(g => {
          const progressPercent = Math.min(100, Math.round((g.completedDays / g.targetDays) * 100));
          const remaining = Math.max(0, g.targetDays - g.completedDays);
          const habit = habits.find(h => h.id === g.habitId);

          return (
            <div
              key={g.id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                      <Target className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-base leading-snug">
                        {g.name}
                      </h4>
                      {habit && (
                        <span className="text-[11px] text-slate-400">
                          Linked habit: {habit.name}
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDelete(g.id)}
                    className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                    title="Delete goal"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Progress bar */}
                <div className="mt-4 space-y-1.5">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-slate-500">
                      {g.completedDays} of {g.targetDays} days completed
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {progressPercent}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>

                {/* Reward pill */}
                {g.reward && (
                  <div className="mt-3 text-xs bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 p-2.5 rounded-xl border border-amber-200/60 dark:border-amber-900/60 flex items-center gap-2">
                    <Award className="w-4 h-4 text-amber-500 shrink-0" />
                    <span><strong>Reward:</strong> {g.reward}</span>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                <span>{remaining > 0 ? `${remaining} days remaining` : 'Milestone achieved! 🎉'}</span>
                <span className="capitalize font-semibold text-blue-600">{g.status.replace('_', ' ')}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Goal Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Create Milestone Goal
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                  Goal Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 30-Day Workout Streak, 100 Days of Code"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                  Target Days
                </label>
                <input
                  type="number"
                  min="1"
                  value={targetDays}
                  onChange={e => setTargetDays(parseInt(e.target.value) || 1)}
                  className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                  Link Habit (optional)
                </label>
                <select
                  value={selectedHabitId}
                  onChange={e => setSelectedHabitId(e.target.value)}
                  className="w-full text-sm px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">No specific habit (Overall)</option>
                  {habits.map(h => (
                    <option key={h.id} value={h.id}>{h.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                  Personal Reward (optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Weekend getaway, new tech gadget, dinner"
                  value={reward}
                  onChange={e => setReward(e.target.value)}
                  className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="mt-6 flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-semibold shadow-xs hover:bg-blue-700"
                >
                  Save Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
