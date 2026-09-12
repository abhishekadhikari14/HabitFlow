import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { db } from './server/dbStore';
import {
  generateAnalyticsOverview,
  generateDailyTrend,
  generateHabitPerformance,
  generateHeatmap
} from './server/analyticsEngine';
import { generateGeminiInsights, chatWithHabitCoach } from './server/geminiService';
import { Habit, Goal } from './src/types';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Helper to resolve user from auth header or default to 'demo-user'
function getUserId(req: express.Request): string {
  const auth = req.headers.authorization;
  if (auth && auth.startsWith('Bearer ')) {
    const token = auth.substring(7);
    if (token && token !== 'null' && token !== 'undefined') {
      return token;
    }
  }
  return 'demo-user';
}

// ========================
// AUTH ROUTES
// ========================
app.get('/api/auth/me', (req, res) => {
  const userId = getUserId(req);
  let user = db.getUser(userId);
  if (!user) {
    user = {
      id: userId,
      name: 'Abhishek',
      email: 'iamabhishekadhikari20@gmail.com',
      onboardingCompleted: true,
      preferences: {
        theme: 'light',
        reminderTime: '08:00',
        focusAreas: ['Study', 'Fitness', 'Reading'],
        primaryObstacles: ['Lack of time', 'Low energy'],
        weekStartsOn: 'monday',
        notificationsEnabled: true
      }
    };
    db.upsertUser(user);
  }
  res.json({ user, token: user.id });
});

app.post('/api/auth/register', (req, res) => {
  const { name, email } = req.body;
  const id = `user-${Date.now()}`;
  const newUser = {
    id,
    name: name || 'New User',
    email: email || `${id}@habitflow.ai`,
    onboardingCompleted: false,
    preferences: {
      theme: 'light' as const,
      reminderTime: '08:00',
      focusAreas: ['Productivity', 'Health'],
      primaryObstacles: ['Lack of time'],
      weekStartsOn: 'monday' as const,
      notificationsEnabled: true
    }
  };
  db.upsertUser(newUser);
  res.json({ user: newUser, token: id });
});

app.post('/api/auth/login', (req, res) => {
  const { email } = req.body;
  const user = db.getUser('demo-user');
  res.json({ user, token: user?.id || 'demo-user' });
});

app.post('/api/auth/logout', (_req, res) => {
  res.json({ status: 'ok' });
});

// ========================
// HABIT ROUTES
// ========================
app.get('/api/habits', (req, res) => {
  const userId = getUserId(req);
  const habits = db.getHabits(userId);
  res.json(habits);
});

app.post('/api/habits', (req, res) => {
  const userId = getUserId(req);
  const {
    name,
    description,
    category,
    frequency,
    customDays,
    target,
    targetUnit,
    preferredTime,
    timeOfDay,
    difficulty,
    priority,
    color,
    icon
  } = req.body;

  const id = `habit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const newHabit: Habit = {
    id,
    userId,
    name: name || 'New Habit',
    description: description || '',
    category: category || 'General',
    frequency: frequency || 'daily',
    customDays,
    target: Number(target) || 1,
    targetUnit: targetUnit || 'times',
    preferredTime: preferredTime || '09:00',
    timeOfDay: timeOfDay || 'morning',
    difficulty: difficulty || 'medium',
    priority: priority || 'medium',
    startDate: new Date().toISOString().split('T')[0],
    active: true,
    color: color || '#3b82f6',
    icon: icon || 'CheckCircle',
    streak: 0,
    bestStreak: 0,
    createdAt: new Date().toISOString()
  };

  const saved = db.createHabit(newHabit);
  res.status(201).json(saved);
});

app.put('/api/habits/:id', (req, res) => {
  const { id } = req.params;
  const updated = db.updateHabit(id, req.body);
  if (!updated) {
    return res.status(404).json({ error: 'Habit not found' });
  }
  res.json(updated);
});

app.delete('/api/habits/:id', (req, res) => {
  const { id } = req.params;
  const success = db.deleteHabit(id);
  res.json({ success });
});

app.post('/api/habits/:id/complete', (req, res) => {
  const userId = getUserId(req);
  const { id } = req.params;
  const { date, mood, energy, sleepHours, note, value } = req.body;
  const logDate = date || new Date().toISOString().split('T')[0];

  const log = db.logHabit(userId, id, logDate, 'completed', {
    mood: mood ? Number(mood) : undefined,
    energy: energy ? Number(energy) : undefined,
    sleepHours: sleepHours ? Number(sleepHours) : undefined,
    note,
    value: value ? Number(value) : undefined
  });

  const habit = db.getHabit(id);
  res.json({ log, habit });
});

app.post('/api/habits/:id/skip', (req, res) => {
  const userId = getUserId(req);
  const { id } = req.params;
  const { date, skipReason, mood, energy, sleepHours, note } = req.body;
  const logDate = date || new Date().toISOString().split('T')[0];

  const log = db.logHabit(userId, id, logDate, 'skipped', {
    skipReason: skipReason || 'Other',
    mood: mood ? Number(mood) : undefined,
    energy: energy ? Number(energy) : undefined,
    sleepHours: sleepHours ? Number(sleepHours) : undefined,
    note
  });

  const habit = db.getHabit(id);
  res.json({ log, habit });
});

app.post('/api/habits/:id/uncomplete', (req, res) => {
  const userId = getUserId(req);
  const { id } = req.params;
  const { date } = req.body;
  const logDate = date || new Date().toISOString().split('T')[0];

  db.removeLog(userId, id, logDate);
  const habit = db.getHabit(id);
  if (habit && habit.streak > 0) {
    habit.streak -= 1;
  }
  res.json({ success: true, habit });
});

// ========================
// ANALYTICS ROUTES
// ========================
app.get('/api/analytics/overview', (req, res) => {
  const userId = getUserId(req);
  const range = (req.query.range as string) || '30d';

  let daysBack = 30;
  if (range === '7d') daysBack = 7;
  else if (range === '90d') daysBack = 90;
  else if (range === '6m') daysBack = 180;
  else if (range === '1y') daysBack = 365;

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - daysBack);
  const startStr = startDate.toISOString().split('T')[0];

  const habits = db.getHabits(userId);
  const logs = db.getLogs(userId, startStr);

  const overview = generateAnalyticsOverview(habits, logs, range);
  res.json(overview);
});

app.get('/api/analytics/daily', (req, res) => {
  const userId = getUserId(req);
  const range = (req.query.range as string) || '14d';
  const days = range === '7d' ? 7 : range === '30d' ? 30 : 14;

  const logs = db.getLogs(userId);
  const trend = generateDailyTrend(logs, days);
  res.json(trend);
});

app.get('/api/analytics/performance', (req, res) => {
  const userId = getUserId(req);
  const habits = db.getHabits(userId);
  const logs = db.getLogs(userId);
  const performance = generateHabitPerformance(habits, logs);
  res.json(performance);
});

app.get('/api/analytics/heatmap', (req, res) => {
  const userId = getUserId(req);
  const days = req.query.days ? parseInt(req.query.days as string, 10) : 84;
  const habits = db.getHabits(userId);
  const logs = db.getLogs(userId);
  const heatmap = generateHeatmap(logs, habits.length, days);
  res.json(heatmap);
});

app.get('/api/analytics/reasons', (req, res) => {
  const userId = getUserId(req);
  const habits = db.getHabits(userId);
  const logs = db.getLogs(userId);
  const overview = generateAnalyticsOverview(habits, logs, '30d');
  res.json(overview.topSkipReasons);
});

// ========================
// CALENDAR & HISTORY
// ========================
app.get('/api/calendar', (req, res) => {
  const userId = getUserId(req);
  const year = parseInt((req.query.year as string) || String(new Date().getFullYear()), 10);
  const month = parseInt((req.query.month as string) || String(new Date().getMonth() + 1), 10);

  const start = new Date(year, month - 1, 1).toISOString().split('T')[0];
  const end = new Date(year, month, 0).toISOString().split('T')[0];

  const habits = db.getHabits(userId);
  const logs = db.getLogs(userId, start, end);

  // Group logs by date
  const dateMap: { [date: string]: any } = {};
  for (const log of logs) {
    if (!dateMap[log.date]) {
      dateMap[log.date] = {
        date: log.date,
        completedHabits: [],
        skippedHabits: [],
        missedHabits: [],
        mood: log.mood,
        energy: log.energy,
        sleepHours: log.sleepHours,
        notes: []
      };
    }
    const habit = habits.find(h => h.id === log.habitId);
    const item = { logId: log.id, habitName: habit?.name || 'Habit', category: habit?.category, status: log.status, reason: log.skipReason };

    if (log.status === 'completed') dateMap[log.date].completedHabits.push(item);
    else if (log.status === 'skipped') dateMap[log.date].skippedHabits.push(item);
    else dateMap[log.date].missedHabits.push(item);

    if (log.note) dateMap[log.date].notes.push(log.note);
  }

  res.json(dateMap);
});

// ========================
// GOALS ROUTES
// ========================
app.get('/api/goals', (req, res) => {
  const userId = getUserId(req);
  const goals = db.getGoals(userId);
  res.json(goals);
});

app.post('/api/goals', (req, res) => {
  const userId = getUserId(req);
  const { name, habitId, targetDays, reward } = req.body;
  const id = `goal-${Date.now()}`;
  const newGoal: Goal = {
    id,
    userId,
    name: name || 'New Milestone Goal',
    habitId,
    targetDays: Number(targetDays) || 30,
    completedDays: 0,
    startDate: new Date().toISOString().split('T')[0],
    status: 'in_progress',
    reward
  };
  db.createGoal(newGoal);
  res.status(201).json(newGoal);
});

app.put('/api/goals/:id', (req, res) => {
  const { id } = req.params;
  const updated = db.updateGoal(id, req.body);
  res.json(updated);
});

app.delete('/api/goals/:id', (req, res) => {
  const { id } = req.params;
  const success = db.deleteGoal(id);
  res.json({ success });
});

// ========================
// NOTIFICATIONS
// ========================
app.get('/api/notifications', (req, res) => {
  const userId = getUserId(req);
  const items = db.getNotifications(userId);
  res.json(items);
});

app.post('/api/notifications/:id/read', (req, res) => {
  const { id } = req.params;
  db.markNotificationRead(id);
  res.json({ success: true });
});

app.post('/api/notifications/clear', (req, res) => {
  const userId = getUserId(req);
  db.clearNotifications(userId);
  res.json({ success: true });
});

// ========================
// REPORTS & EXPORT
// ========================
app.get('/api/reports/summary', (req, res) => {
  const userId = getUserId(req);
  const type = (req.query.type as string) || 'weekly';
  const habits = db.getHabits(userId);
  const logs = db.getLogs(userId);
  const overview = generateAnalyticsOverview(habits, logs, type === 'monthly' ? '30d' : '7d');

  res.json({
    type,
    generatedAt: new Date().toISOString(),
    completionRate: overview.overallCompletionRate,
    currentStreak: overview.currentStreak,
    bestHabit: overview.strongestHabit,
    weakestHabit: overview.weakestHabit,
    consistencyScore: overview.consistencyScore,
    topInconsistencyReason: overview.topSkipReasons[0] || null,
    recommendation: overview.eveningCompletionRate < 60
      ? 'Reschedule demanding habits to morning intervals'
      : 'Maintain daily micro-targets during high workload days'
  });
});

app.get('/api/reports/export-csv', (req, res) => {
  const userId = getUserId(req);
  const habits = db.getHabits(userId);
  const logs = db.getLogs(userId);

  const habitMap = new Map(habits.map(h => [h.id, h.name]));
  let csv = 'Date,Habit,Status,SkipReason,Mood,Energy,SleepHours,Note\n';

  for (const l of logs) {
    const habitName = `"${(habitMap.get(l.habitId) || 'Habit').replace(/"/g, '""')}"`;
    const note = `"${(l.note || '').replace(/"/g, '""')}"`;
    csv += `${l.date},${habitName},${l.status},${l.skipReason || ''},${l.mood || ''},${l.energy || ''},${l.sleepHours || ''},${note}\n`;
  }

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="habitflow_history.csv"');
  res.send(csv);
});

// ========================
// AI INSIGHTS & CHAT
// ========================
app.get('/api/ai/insights', async (req, res) => {
  const userId = getUserId(req);
  const user = db.getUser(userId);
  const habits = db.getHabits(userId);
  const logs = db.getLogs(userId);
  const overview = generateAnalyticsOverview(habits, logs, '30d');

  try {
    const insights = await generateGeminiInsights(overview, habits, user?.name || 'User');
    res.json(insights);
  } catch (err) {
    console.error('AI Insights endpoint error:', err);
    res.status(500).json({ error: 'Failed to generate insights' });
  }
});

app.get('/api/ai/chat/history', (req, res) => {
  const userId = getUserId(req);
  const chats = db.getChats(userId);
  res.json(chats);
});

app.post('/api/ai/chat', async (req, res) => {
  const userId = getUserId(req);
  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  const user = db.getUser(userId);
  const habits = db.getHabits(userId);
  const logs = db.getLogs(userId);
  const overview = generateAnalyticsOverview(habits, logs, '30d');

  // Record user message
  const userMsg = {
    id: `chat-${Date.now()}-u`,
    userId,
    role: 'user' as const,
    content: message,
    timestamp: new Date().toISOString()
  };
  db.addChat(userId, userMsg);

  const chats = db.getChats(userId);
  const history = chats.slice(-6).map(c => ({ role: c.role, content: c.content }));

  try {
    const aiResult = await chatWithHabitCoach(
      message,
      overview,
      habits,
      user?.name || 'User',
      history
    );

    const assistantMsg = {
      id: `chat-${Date.now()}-a`,
      userId,
      role: 'assistant' as const,
      content: aiResult.text,
      timestamp: new Date().toISOString(),
      groundedFacts: aiResult.groundedFacts
    };
    db.addChat(userId, assistantMsg);

    res.json({ message: assistantMsg });
  } catch (err) {
    console.error('Chat error:', err);
    res.status(500).json({ error: 'Failed to respond' });
  }
});

// ========================
// DEMO DATA SEED / RESET
// ========================
app.post('/api/demo/reset-zero', (req, res) => {
  const userId = getUserId(req);
  const user = db.getUser(userId);
  db.resetToZero(userId, user?.name, user?.email);
  res.json({ success: true, message: 'All habit tracking values have been set to default zero' });
});

app.post('/api/demo/seed-sample', (req, res) => {
  const userId = getUserId(req);
  const user = db.getUser(userId);
  db.resetDemoData(userId, user?.name, user?.email);
  res.json({ success: true, message: 'Loaded 60 days of realistic behavioral telemetry sample data' });
});

app.post('/api/demo/reset', (req, res) => {
  const userId = getUserId(req);
  const user = db.getUser(userId);
  db.resetToZero(userId, user?.name, user?.email);
  res.json({ success: true, message: 'All values reset to default zero' });
});

// ========================
// USER SETTINGS
// ========================
app.get('/api/settings', (req, res) => {
  const userId = getUserId(req);
  const user = db.getUser(userId);
  res.json(user?.preferences || {});
});

app.put('/api/settings', (req, res) => {
  const userId = getUserId(req);
  const user = db.getUser(userId);
  if (user) {
    user.preferences = { ...user.preferences, ...req.body };
    db.upsertUser(user);
  }
  res.json(user?.preferences || {});
});

// ========================
// VITE / STATIC SERVING
// ========================
async function start() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`HabitFlow AI Server listening on http://0.0.0.0:${PORT}`);
  });
}

start();
