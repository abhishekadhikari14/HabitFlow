import React from 'react';
import {
  LayoutDashboard,
  CheckSquare,
  BarChart2,
  Brain,
  Calendar as CalendarIcon,
  Target,
  FileText,
  Settings,
  Flame,
  User
} from 'lucide-react';
import { UserProfile } from '../types';

interface SidebarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  user: UserProfile | null;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onTabChange, user }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'habits', label: 'My Habits', icon: CheckSquare },
    { id: 'analytics', label: 'Analytics', icon: BarChart2 },
    { id: 'ai_insights', label: 'AI Insights', icon: Brain, badge: 'AI' },
    { id: 'calendar', label: 'Calendar', icon: CalendarIcon },
    { id: 'goals', label: 'Milestone Goals', icon: Target },
    { id: 'reports', label: 'Reports & Export', icon: FileText },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800 flex flex-col justify-between p-4 shrink-0 transition-colors hidden md:flex">
      <div>
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-2.5 px-3 py-3 mb-6">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-xs">
            <Flame className="w-5 h-5 fill-white text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-slate-900 dark:text-white text-base tracking-tight">
                HabitFlow
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800">
                AI
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-medium block">
              Consistency Intelligence
            </span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-inherit' : 'text-slate-400 dark:text-slate-500'}`} />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-md uppercase tracking-wider ${
                    isActive
                      ? 'bg-purple-500 text-white'
                      : 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* User profile capsule at bottom */}
      <div className="pt-4 border-t border-slate-100 dark:border-slate-800 px-2 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300 flex items-center justify-center font-bold text-xs shrink-0">
          {user?.name ? user.name[0].toUpperCase() : 'A'}
        </div>
        <div className="overflow-hidden">
          <div className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
            {user?.name || 'Abhishek'}
          </div>
          <div className="text-[11px] text-slate-400 truncate">
            {user?.email || 'iamabhishekadhikari20@gmail.com'}
          </div>
        </div>
      </div>
    </aside>
  );
};
