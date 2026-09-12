import React, { useState } from 'react';
import { UserProfile, NotificationItem } from '../types';
import {
  Bell,
  Sun,
  Moon,
  Plus,
  Brain,
  RotateCcw,
  Check,
  Trash2,
  Sparkles
} from 'lucide-react';

interface HeaderProps {
  user: UserProfile | null;
  notifications: NotificationItem[];
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onOpenNewHabit: () => void;
  onOpenAIChat: () => void;
  onResetDemo: () => void;
  onClearNotifications: () => void;
  onNotificationRead: (id: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  notifications,
  theme,
  onToggleTheme,
  onOpenNewHabit,
  onOpenAIChat,
  onResetDemo,
  onClearNotifications,
  onNotificationRead
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;

  // Time-aware greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 px-4 sm:px-8 py-3.5 flex items-center justify-between transition-colors">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {getGreeting()}, {user?.name || 'Abhishek'}
          </h1>
          <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
            <Sparkles className="w-3 h-3 text-emerald-500" /> Active Streak
          </span>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Focus on daily execution and routine stability today.
        </p>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Ask AI Coach Quick Button */}
        <button
          type="button"
          onClick={onOpenAIChat}
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200/80 dark:border-purple-800 hover:bg-purple-100 dark:hover:bg-purple-900/50 text-xs font-semibold transition-colors"
        >
          <Brain className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
          <span>Ask Coach</span>
        </button>

        {/* Demo reset button */}
        <button
          type="button"
          onClick={onResetDemo}
          title="Reset all habit tracking values to default zero"
          className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-xs flex items-center gap-1"
        >
          <RotateCcw className="w-4 h-4" />
          <span className="hidden lg:inline text-xs font-medium">Reset to 0</span>
        </button>

        {/* Notification Bell with Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-600 ring-2 ring-white dark:ring-slate-900" />
            )}
          </button>

          {showNotifications && (
            <>
              <div
                className="fixed inset-0 z-20"
                onClick={() => setShowNotifications(false)}
              />
              <div className="absolute right-0 mt-2 w-80 sm:w-88 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-4 z-30 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                      Notifications
                    </h4>
                    {unreadCount > 0 && (
                      <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  {notifications.length > 0 && (
                    <button
                      type="button"
                      onClick={onClearNotifications}
                      className="text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" /> Clear
                    </button>
                  )}
                </div>

                <div className="mt-3 space-y-2 max-h-72 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="py-6 text-center text-xs text-slate-400">
                      No notifications right now
                    </div>
                  ) : (
                    notifications.map(n => (
                      <div
                        key={n.id}
                        onClick={() => onNotificationRead(n.id)}
                        className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-colors ${
                          n.read
                            ? 'bg-transparent border-transparent opacity-60'
                            : 'bg-blue-50/50 dark:bg-blue-950/20 border-blue-100 dark:border-blue-900/40'
                        }`}
                      >
                        <div className="font-semibold text-slate-800 dark:text-slate-200">
                          {n.title}
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 mt-0.5 leading-normal">
                          {n.message}
                        </p>
                        <span className="text-[10px] text-slate-400 mt-1 block">
                          {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Theme Toggle */}
        <button
          type="button"
          onClick={onToggleTheme}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-slate-600" />
          )}
        </button>

        {/* Create Habit Button */}
        <button
          type="button"
          onClick={onOpenNewHabit}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add Habit</span>
        </button>
      </div>
    </header>
  );
};
