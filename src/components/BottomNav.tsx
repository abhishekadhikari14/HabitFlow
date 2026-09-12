import React from 'react';
import {
  LayoutDashboard,
  CheckSquare,
  BarChart2,
  Brain,
  Calendar,
  Settings
} from 'lucide-react';

interface BottomNavProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, onTabChange }) => {
  const items = [
    { id: 'dashboard', label: 'Today', icon: LayoutDashboard },
    { id: 'habits', label: 'Habits', icon: CheckSquare },
    { id: 'analytics', label: 'Analytics', icon: BarChart2 },
    { id: 'ai_insights', label: 'Insights', icon: Brain },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 md:hidden flex justify-around py-2 px-1">
      {items.map(item => {
        const Icon = item.icon;
        const isActive = currentTab === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onTabChange(item.id)}
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl text-[10px] font-semibold transition-colors ${
              isActive
                ? 'text-blue-600 dark:text-blue-400 font-bold'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
            }`}
          >
            <Icon className={`w-5 h-5 mb-0.5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
