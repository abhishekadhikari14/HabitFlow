import React, { useState, useEffect } from 'react';
import {
  UserProfile,
  Habit,
  AnalyticsOverview,
  DailyTrendPoint,
  NotificationItem
} from './types';
import {
  fetchUser,
  fetchHabits,
  createHabit,
  updateHabit,
  deleteHabit,
  completeHabit,
  skipHabit,
  uncompleteHabit,
  fetchAnalyticsOverview,
  fetchDailyTrend,
  fetchNotifications,
  markNotificationRead,
  clearNotifications,
  resetDemoData,
  resetToZero,
  seedSampleData
} from './lib/api';

import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { HabitModal } from './components/HabitModal';
import { AIChatModal } from './components/AIChatModal';
import { OnboardingModal } from './components/OnboardingModal';

import { DashboardView } from './views/DashboardView';
import { HabitsView } from './views/HabitsView';
import { AnalyticsView } from './views/AnalyticsView';
import { AIInsightsView } from './views/AIInsightsView';
import { CalendarView } from './views/CalendarView';
import { GoalsView } from './views/GoalsView';
import { ReportsView } from './views/ReportsView';
import { SettingsView } from './views/SettingsView';

export default function App() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [dailyTrend, setDailyTrend] = useState<DailyTrendPoint[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // Modals state
  const [isHabitModalOpen, setIsHabitModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  const [chatInitialPrompt, setChatInitialPrompt] = useState('');
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);

  useEffect(() => {
    // Check initial theme preference
    const savedTheme = localStorage.getItem('habitflow_theme');
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setTheme('dark');
      document.documentElement.classList.add('dark');
    } else {
      setTheme('light');
      document.documentElement.classList.remove('dark');
    }

    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const [{ user: userData }, habitList, overviewData, trendData, notifs] = await Promise.all([
        fetchUser(),
        fetchHabits(),
        fetchAnalyticsOverview('30d'),
        fetchDailyTrend('14d'),
        fetchNotifications()
      ]);

      setUser(userData);
      setHabits(habitList);
      setOverview(overviewData);
      setDailyTrend(trendData);
      setNotifications(notifs);

      // Trigger onboarding if not completed
      if (!userData.onboardingCompleted) {
        setIsOnboardingOpen(true);
      }
    } catch (err) {
      console.error('Error loading initial applet data:', err);
    }
  };

  const reloadHabitsAndOverview = async () => {
    try {
      const [habitList, overviewData, trendData] = await Promise.all([
        fetchHabits(),
        fetchAnalyticsOverview('30d'),
        fetchDailyTrend('14d')
      ]);
      setHabits(habitList);
      setOverview(overviewData);
      setDailyTrend(trendData);
    } catch (err) {
      console.error('Error refreshing habits & metrics:', err);
    }
  };

  const handleToggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    localStorage.setItem('habitflow_theme', nextTheme);
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleCompleteHabit = async (id: string, details?: any) => {
    try {
      await completeHabit(id, details);
      await reloadHabitsAndOverview();
    } catch (err) {
      console.error('Failed to complete habit:', err);
    }
  };

  const handleSkipHabit = async (id: string, details: any) => {
    try {
      await skipHabit(id, details);
      await reloadHabitsAndOverview();
    } catch (err) {
      console.error('Failed to skip habit:', err);
    }
  };

  const handleUncompleteHabit = async (id: string) => {
    try {
      await uncompleteHabit(id);
      await reloadHabitsAndOverview();
    } catch (err) {
      console.error('Failed to uncomplete habit:', err);
    }
  };

  const handleSaveHabit = async (habitData: Partial<Habit>) => {
    try {
      if (editingHabit) {
        await updateHabit(editingHabit.id, habitData);
      } else {
        await createHabit(habitData);
      }
      setEditingHabit(null);
      await reloadHabitsAndOverview();
    } catch (err) {
      console.error('Failed to save habit:', err);
    }
  };

  const handleDeleteHabit = async (id: string) => {
    try {
      await deleteHabit(id);
      await reloadHabitsAndOverview();
    } catch (err) {
      console.error('Failed to delete habit:', err);
    }
  };

  const handleResetDemo = async () => {
    try {
      await resetToZero();
      await loadInitialData();
    } catch (err) {
      console.error('Failed to reset demo data:', err);
    }
  };

  const handleResetToZero = async () => {
    try {
      await resetToZero();
      await loadInitialData();
    } catch (err) {
      console.error('Failed to reset to zero:', err);
    }
  };

  const handleSeedSample = async () => {
    try {
      await seedSampleData();
      await loadInitialData();
    } catch (err) {
      console.error('Failed to seed sample data:', err);
    }
  };

  const handleNotificationRead = async (id: string) => {
    await markNotificationRead(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const handleClearNotifications = async () => {
    await clearNotifications();
    setNotifications([]);
  };

  const handleOpenAIChatWithPrompt = (prompt?: string) => {
    setChatInitialPrompt(prompt || '');
    setIsAIChatOpen(true);
  };

  const handleOnboardingComplete = async (firstHabitData?: Partial<Habit>) => {
    setIsOnboardingOpen(false);
    if (firstHabitData) {
      try {
        await createHabit(firstHabitData);
        await reloadHabitsAndOverview();
      } catch (err) {
        console.error('Failed to create onboarding habit:', err);
      }
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans antialiased overflow-hidden">
      {/* Desktop Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        user={user}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Header */}
        <Header
          user={user}
          notifications={notifications}
          theme={theme}
          onToggleTheme={handleToggleTheme}
          onOpenNewHabit={() => {
            setEditingHabit(null);
            setIsHabitModalOpen(true);
          }}
          onOpenAIChat={() => handleOpenAIChatWithPrompt()}
          onResetDemo={handleResetDemo}
          onClearNotifications={handleClearNotifications}
          onNotificationRead={handleNotificationRead}
        />

        {/* Scrollable View Container */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8">
          <div className="max-w-7xl mx-auto">
            {currentTab === 'dashboard' && (
              <DashboardView
                habits={habits}
                overview={overview}
                dailyTrend={dailyTrend}
                onCompleteHabit={handleCompleteHabit}
                onSkipHabit={handleSkipHabit}
                onUncompleteHabit={handleUncompleteHabit}
                onEditHabit={(h) => {
                  setEditingHabit(h);
                  setIsHabitModalOpen(true);
                }}
                onDeleteHabit={handleDeleteHabit}
                onOpenNewHabit={() => {
                  setEditingHabit(null);
                  setIsHabitModalOpen(true);
                }}
                onNavigateToTab={setCurrentTab}
                onOpenAIChat={() => handleOpenAIChatWithPrompt()}
              />
            )}

            {currentTab === 'habits' && (
              <HabitsView
                habits={habits}
                onCompleteHabit={handleCompleteHabit}
                onSkipHabit={handleSkipHabit}
                onUncompleteHabit={handleUncompleteHabit}
                onEditHabit={(h) => {
                  setEditingHabit(h);
                  setIsHabitModalOpen(true);
                }}
                onDeleteHabit={handleDeleteHabit}
                onOpenNewHabit={() => {
                  setEditingHabit(null);
                  setIsHabitModalOpen(true);
                }}
              />
            )}

            {currentTab === 'analytics' && <AnalyticsView />}

            {currentTab === 'ai_insights' && (
              <AIInsightsView
                onOpenAIChatWithPrompt={handleOpenAIChatWithPrompt}
              />
            )}

            {currentTab === 'calendar' && <CalendarView />}

            {currentTab === 'goals' && <GoalsView />}

            {currentTab === 'reports' && <ReportsView />}

            {currentTab === 'settings' && (
              <SettingsView
                user={user}
                theme={theme}
                onToggleTheme={handleToggleTheme}
                onResetDemo={handleResetToZero}
                onResetToZero={handleResetToZero}
                onSeedSampleData={handleSeedSample}
                onRunOnboarding={() => setIsOnboardingOpen(true)}
              />
            )}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <BottomNav
        currentTab={currentTab}
        onTabChange={setCurrentTab}
      />

      {/* Habit Create / Edit Modal */}
      <HabitModal
        isOpen={isHabitModalOpen}
        onClose={() => {
          setIsHabitModalOpen(false);
          setEditingHabit(null);
        }}
        onSubmit={handleSaveHabit}
        initialHabit={editingHabit}
      />

      {/* AI Chat Modal */}
      <AIChatModal
        isOpen={isAIChatOpen}
        onClose={() => setIsAIChatOpen(false)}
        initialPrompt={chatInitialPrompt}
      />

      {/* Onboarding Flow Modal */}
      <OnboardingModal
        isOpen={isOnboardingOpen}
        onComplete={handleOnboardingComplete}
      />
    </div>
  );
}
