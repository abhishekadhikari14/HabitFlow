import {
  Habit,
  HabitLog,
  Goal,
  NotificationItem,
  UserProfile,
  AnalyticsOverview,
  DailyTrendPoint,
  HabitPerformanceItem,
  HeatmapDay,
  AIInsight
} from '../types';

const API_BASE = '/api';

export async function fetchUser(): Promise<{ user: UserProfile; token: string }> {
  const res = await fetch(`${API_BASE}/auth/me`);
  if (!res.ok) throw new Error('Failed to fetch user');
  return res.json();
}

export async function updateUserProfile(data: Partial<UserProfile>): Promise<UserProfile> {
  const res = await fetch(`${API_BASE}/settings`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to update settings');
  return res.json();
}

export async function fetchHabits(): Promise<Habit[]> {
  const res = await fetch(`${API_BASE}/habits`);
  if (!res.ok) throw new Error('Failed to fetch habits');
  return res.json();
}

export async function createHabit(habitData: Partial<Habit>): Promise<Habit> {
  const res = await fetch(`${API_BASE}/habits`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(habitData)
  });
  if (!res.ok) throw new Error('Failed to create habit');
  return res.json();
}

export async function updateHabit(id: string, updates: Partial<Habit>): Promise<Habit> {
  const res = await fetch(`${API_BASE}/habits/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates)
  });
  if (!res.ok) throw new Error('Failed to update habit');
  return res.json();
}

export async function deleteHabit(id: string): Promise<boolean> {
  const res = await fetch(`${API_BASE}/habits/${id}`, { method: 'DELETE' });
  return res.ok;
}

export async function completeHabit(
  id: string,
  details?: { mood?: number; energy?: number; sleepHours?: number; note?: string; value?: number }
): Promise<{ log: HabitLog; habit: Habit }> {
  const res = await fetch(`${API_BASE}/habits/${id}/complete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(details || {})
  });
  if (!res.ok) throw new Error('Failed to complete habit');
  return res.json();
}

export async function skipHabit(
  id: string,
  details: { skipReason: string; mood?: number; energy?: number; sleepHours?: number; note?: string }
): Promise<{ log: HabitLog; habit: Habit }> {
  const res = await fetch(`${API_BASE}/habits/${id}/skip`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(details)
  });
  if (!res.ok) throw new Error('Failed to skip habit');
  return res.json();
}

export async function uncompleteHabit(id: string): Promise<boolean> {
  const res = await fetch(`${API_BASE}/habits/${id}/uncomplete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({})
  });
  return res.ok;
}

export async function fetchAnalyticsOverview(range: string = '30d'): Promise<AnalyticsOverview> {
  const res = await fetch(`${API_BASE}/analytics/overview?range=${range}`);
  if (!res.ok) throw new Error('Failed to fetch analytics overview');
  return res.json();
}

export async function fetchDailyTrend(range: string = '14d'): Promise<DailyTrendPoint[]> {
  const res = await fetch(`${API_BASE}/analytics/daily?range=${range}`);
  if (!res.ok) throw new Error('Failed to fetch daily trend');
  return res.json();
}

export async function fetchHabitPerformance(): Promise<HabitPerformanceItem[]> {
  const res = await fetch(`${API_BASE}/analytics/performance`);
  if (!res.ok) throw new Error('Failed to fetch habit performance');
  return res.json();
}

export async function fetchHeatmap(days: number = 84): Promise<HeatmapDay[]> {
  const res = await fetch(`${API_BASE}/analytics/heatmap?days=${days}`);
  if (!res.ok) throw new Error('Failed to fetch heatmap');
  return res.json();
}

export async function fetchCalendar(year: number, month: number): Promise<{ [date: string]: any }> {
  const res = await fetch(`${API_BASE}/calendar?year=${year}&month=${month}`);
  if (!res.ok) throw new Error('Failed to fetch calendar data');
  return res.json();
}

export async function fetchGoals(): Promise<Goal[]> {
  const res = await fetch(`${API_BASE}/goals`);
  if (!res.ok) throw new Error('Failed to fetch goals');
  return res.json();
}

export async function createGoal(goal: Partial<Goal>): Promise<Goal> {
  const res = await fetch(`${API_BASE}/goals`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(goal)
  });
  if (!res.ok) throw new Error('Failed to create goal');
  return res.json();
}

export async function updateGoal(id: string, updates: Partial<Goal>): Promise<Goal> {
  const res = await fetch(`${API_BASE}/goals/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates)
  });
  if (!res.ok) throw new Error('Failed to update goal');
  return res.json();
}

export async function deleteGoal(id: string): Promise<boolean> {
  const res = await fetch(`${API_BASE}/goals/${id}`, { method: 'DELETE' });
  return res.ok;
}

export async function fetchNotifications(): Promise<NotificationItem[]> {
  const res = await fetch(`${API_BASE}/notifications`);
  if (!res.ok) return [];
  return res.json();
}

export async function markNotificationRead(id: string): Promise<void> {
  await fetch(`${API_BASE}/notifications/${id}/read`, { method: 'POST' });
}

export async function clearNotifications(): Promise<void> {
  await fetch(`${API_BASE}/notifications/clear`, { method: 'POST' });
}

export async function fetchAIInsights(): Promise<AIInsight[]> {
  const res = await fetch(`${API_BASE}/ai/insights`);
  if (!res.ok) throw new Error('Failed to fetch AI insights');
  return res.json();
}

export async function fetchChatHistory(): Promise<any[]> {
  const res = await fetch(`${API_BASE}/ai/chat/history`);
  if (!res.ok) return [];
  return res.json();
}

export async function sendChatMessage(message: string): Promise<{ message: any }> {
  const res = await fetch(`${API_BASE}/ai/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message })
  });
  if (!res.ok) throw new Error('Failed to send chat message');
  return res.json();
}

export async function resetDemoData(): Promise<void> {
  const res = await fetch(`${API_BASE}/demo/reset-zero`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to reset data to zero');
}

export async function resetToZero(): Promise<void> {
  const res = await fetch(`${API_BASE}/demo/reset-zero`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to reset data to zero');
}

export async function seedSampleData(): Promise<void> {
  const res = await fetch(`${API_BASE}/demo/seed-sample`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to seed sample data');
}
