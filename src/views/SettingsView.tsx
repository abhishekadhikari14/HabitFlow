import React, { useState } from 'react';
import { UserProfile } from '../types';
import { updateUserProfile } from '../lib/api';
import {
  User,
  Sun,
  Moon,
  Clock,
  RotateCcw,
  Sparkles,
  Shield,
  Download,
  CheckCircle,
  Bell
} from 'lucide-react';

interface SettingsViewProps {
  user: UserProfile | null;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onResetDemo: () => void;
  onResetToZero?: () => void;
  onSeedSampleData?: () => void;
  onRunOnboarding: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  user,
  theme,
  onToggleTheme,
  onResetDemo,
  onResetToZero,
  onSeedSampleData,
  onRunOnboarding
}) => {
  const [name, setName] = useState(user?.name || 'Abhishek');
  const [reminderTime, setReminderTime] = useState(user?.preferences?.reminderTime || '08:00');
  const [weekStartsOn, setWeekStartsOn] = useState<'monday' | 'sunday'>(user?.preferences?.weekStartsOn || 'monday');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateUserProfile({
        name,
        preferences: {
          ...user?.preferences,
          reminderTime,
          weekStartsOn,
          theme,
          focusAreas: user?.preferences?.focusAreas || ['Study', 'Fitness'],
          primaryObstacles: user?.preferences?.primaryObstacles || ['Lack of time'],
          notificationsEnabled: true
        }
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    } catch (err) {
      console.error('Failed to save settings:', err);
    }
  };

  return (
    <div className="space-y-6 pb-16 max-w-4xl">
      <div>
        <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Settings & Preferences
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Manage your account profile, reminder schedules, and behavioral preferences
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Profile Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            User Profile
          </h3>

          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-extrabold text-xl shadow-xs">
              {name ? name[0].toUpperCase() : 'A'}
            </div>
            <div className="flex-1 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full text-sm px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  disabled
                  value={user?.email || 'iamabhishekadhikari20@gmail.com'}
                  className="w-full text-sm px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 cursor-not-allowed"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Interface & Preferences */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            App Experience & Schedule
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Theme selector */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                  Appearance Theme
                </span>
                <span className="text-[11px] text-slate-400">
                  {theme === 'dark' ? 'Dark Mode (Eye-safe)' : 'Light Mode (High-contrast)'}
                </span>
              </div>
              <button
                type="button"
                onClick={onToggleTheme}
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5"
              >
                {theme === 'dark' ? (
                  <><Sun className="w-3.5 h-3.5 text-amber-400" /> Switch to Light</>
                ) : (
                  <><Moon className="w-3.5 h-3.5 text-slate-600" /> Switch to Dark</>
                )}
              </button>
            </div>

            {/* Daily check-in reminder */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                  Daily Check-in Reminder
                </span>
                <span className="text-[11px] text-slate-400">
                  Ideal hour for logging habits
                </span>
              </div>
              <input
                type="time"
                value={reminderTime}
                onChange={e => setReminderTime(e.target.value)}
                className="text-xs font-bold px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
              />
            </div>

            {/* Week Starts On */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                  Week Starts On
                </span>
                <span className="text-[11px] text-slate-400">
                  Calendar and chart orientation
                </span>
              </div>
              <select
                value={weekStartsOn}
                onChange={e => setWeekStartsOn(e.target.value as any)}
                className="text-xs font-bold px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
              >
                <option value="monday">Monday</option>
                <option value="sunday">Sunday</option>
              </select>
            </div>

            {/* Re-run onboarding */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                  Onboarding Tour
                </span>
                <span className="text-[11px] text-slate-400">
                  Review the 5-step behavioral setup
                </span>
              </div>
              <button
                type="button"
                onClick={onRunOnboarding}
                className="px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 text-xs font-semibold hover:bg-blue-100 transition-colors"
              >
                Run Tour
              </button>
            </div>
          </div>
        </div>

        {/* Demo Data Management */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Data & Sandbox Controls
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Switch between a completely fresh slate (all metrics at default 0) to test habit logging from scratch, or load realistic sample telemetry.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              type="button"
              onClick={onResetToZero || onResetDemo}
              className="px-4 py-2.5 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-xs font-bold rounded-xl flex items-center gap-2 transition-colors"
            >
              <RotateCcw className="w-4 h-4 text-rose-600" />
              <span>Reset All to Default Zero (From Scratch)</span>
            </button>

            {onSeedSampleData && (
              <button
                type="button"
                onClick={onSeedSampleData}
                className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-xl flex items-center gap-2 transition-colors"
              >
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Load 60-Day Sample Telemetry</span>
              </button>
            )}

            <a
              href="/api/reports/export-csv"
              className="px-4 py-2.5 bg-emerald-50 dark:bg-emerald-950/30 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold rounded-xl flex items-center gap-2 transition-colors"
            >
              <Download className="w-4 h-4 text-emerald-600" />
              <span>Export CSV</span>
            </a>
          </div>
        </div>

        {/* Submit button */}
        <div className="flex items-center gap-3">
          <button
            type="submit"
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
          >
            Save Preferences
          </button>
          {savedSuccess && (
            <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
              <CheckCircle className="w-4 h-4" /> Settings updated successfully!
            </span>
          )}
        </div>
      </form>
    </div>
  );
};
