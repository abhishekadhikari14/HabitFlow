import fs from 'fs';
import path from 'path';
import {
  Habit,
  HabitLog,
  Goal,
  NotificationItem,
  UserProfile,
  SkipReason
} from '../src/types';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'habitflow_db.json');

export interface ChatMessage {
  id: string;
  userId: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  groundedFacts?: string[];
}

export interface DatabaseSchema {
  users: { [id: string]: UserProfile & { passwordHash?: string } };
  habits: { [id: string]: Habit };
  logs: { [id: string]: HabitLog };
  goals: { [id: string]: Goal };
  notifications: { [id: string]: NotificationItem };
  chats: { [userId: string]: ChatMessage[] };
}

let dbCache: DatabaseSchema | null = null;

function ensureDbLoaded(): DatabaseSchema {
  if (dbCache) return dbCache;

  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (fs.existsSync(DB_FILE)) {
    try {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      dbCache = JSON.parse(data);
      return dbCache!;
    } catch (err) {
      console.error('Error reading database file, initializing fresh:', err);
    }
  }

  // Initialize fresh database
  dbCache = {
    users: {},
    habits: {},
    logs: {},
    goals: {},
    notifications: {},
    chats: {}
  };

  // Seed default zero starting state
  seedCleanZeroData(dbCache, 'demo-user', 'Abhishek', 'iamabhishekadhikari20@gmail.com');
  saveDb();
  return dbCache;
}

function saveDb() {
  if (!dbCache) return;
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(dbCache, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to persist database:', err);
  }
}

export function seedCleanZeroData(
  db: DatabaseSchema,
  userId: string,
  userName: string = 'Abhishek',
  userEmail: string = 'iamabhishekadhikari20@gmail.com'
) {
  // 1. Create or update user
  db.users[userId] = {
    id: userId,
    name: userName,
    email: userEmail,
    onboardingCompleted: true,
    preferences: {
      theme: 'light',
      reminderTime: '08:00',
      focusAreas: ['Study', 'Fitness', 'Reading', 'Health', 'Meditation'],
      primaryObstacles: ['Lack of time', 'Low energy', 'Distractions'],
      weekStartsOn: 'monday',
      notificationsEnabled: true
    }
  };

  // 2. Define standard habits - ALL INITIALIZED TO DEFAULT ZERO
  const defaultHabits: Omit<Habit, 'userId' | 'createdAt'>[] = [
    {
      id: `${userId}-h1`,
      name: 'Study DSA & Systems',
      description: 'Solve 1 LeetCode problem or study distributed systems concept',
      category: 'Study',
      frequency: 'daily',
      target: 60,
      targetUnit: 'minutes',
      preferredTime: '08:30',
      timeOfDay: 'morning',
      difficulty: 'hard',
      priority: 'high',
      startDate: new Date().toISOString().split('T')[0],
      active: true,
      color: '#3b82f6', // blue
      icon: 'BookOpen',
      streak: 0,
      bestStreak: 0
    },
    {
      id: `${userId}-h2`,
      name: 'Morning Workout',
      description: 'Cardio, strength training, or mobility sequence',
      category: 'Fitness',
      frequency: 'daily',
      target: 40,
      targetUnit: 'minutes',
      preferredTime: '07:15',
      timeOfDay: 'morning',
      difficulty: 'medium',
      priority: 'high',
      startDate: new Date().toISOString().split('T')[0],
      active: true,
      color: '#10b981', // emerald
      icon: 'Activity',
      streak: 0,
      bestStreak: 0
    },
    {
      id: `${userId}-h3`,
      name: 'Read Non-Fiction',
      description: 'Read high-signal books before winding down',
      category: 'Reading',
      frequency: 'daily',
      target: 20,
      targetUnit: 'pages',
      preferredTime: '21:00',
      timeOfDay: 'evening',
      difficulty: 'easy',
      priority: 'medium',
      startDate: new Date().toISOString().split('T')[0],
      active: true,
      color: '#8b5cf6', // purple
      icon: 'Bookmark',
      streak: 0,
      bestStreak: 0
    },
    {
      id: `${userId}-h4`,
      name: 'Mindful Meditation',
      description: 'Box breathing and awareness stillness',
      category: 'Meditation',
      frequency: 'daily',
      target: 10,
      targetUnit: 'minutes',
      preferredTime: '07:00',
      timeOfDay: 'morning',
      difficulty: 'easy',
      priority: 'medium',
      startDate: new Date().toISOString().split('T')[0],
      active: true,
      color: '#06b6d4', // cyan
      icon: 'Smile',
      streak: 0,
      bestStreak: 0
    },
    {
      id: `${userId}-h5`,
      name: 'Daily Hydration (3L)',
      description: 'Track daily water intake throughout daytime',
      category: 'Health',
      frequency: 'daily',
      target: 8,
      targetUnit: 'glasses',
      preferredTime: '12:00',
      timeOfDay: 'afternoon',
      difficulty: 'easy',
      priority: 'low',
      startDate: new Date().toISOString().split('T')[0],
      active: true,
      color: '#0284c7', // sky
      icon: 'Droplet',
      streak: 0,
      bestStreak: 0
    },
    {
      id: `${userId}-h6`,
      name: 'Evening Screen Detox',
      description: 'No laptops or phone doomscrolling 45 mins before sleep',
      category: 'Sleep',
      frequency: 'daily',
      target: 45,
      targetUnit: 'minutes',
      preferredTime: '22:15',
      timeOfDay: 'evening',
      difficulty: 'medium',
      priority: 'medium',
      startDate: new Date().toISOString().split('T')[0],
      active: true,
      color: '#f59e0b', // amber
      icon: 'Moon',
      streak: 0,
      bestStreak: 0
    }
  ];

  for (const h of defaultHabits) {
    db.habits[h.id] = {
      ...h,
      userId,
      createdAt: new Date().toISOString()
    };
  }

  // 3. ZERO LOGS - completely empty
  for (const id of Object.keys(db.logs)) {
    if (db.logs[id].userId === userId) {
      delete db.logs[id];
    }
  }

  // 4. Sample Goals - 0 days completed
  db.goals[`${userId}-g1`] = {
    id: `${userId}-g1`,
    userId,
    name: '30-Day LeetCode & DSA Consistency Streak',
    habitId: `${userId}-h1`,
    targetDays: 30,
    completedDays: 0,
    startDate: new Date().toISOString().split('T')[0],
    endDate: getFutureDate(30),
    status: 'in_progress',
    reward: 'Purchase mechanical keyboard'
  };

  db.goals[`${userId}-g2`] = {
    id: `${userId}-g2`,
    userId,
    name: 'Establish 4-Day Weekly Workout Routine',
    habitId: `${userId}-h2`,
    targetDays: 24,
    completedDays: 0,
    startDate: new Date().toISOString().split('T')[0],
    endDate: getFutureDate(24),
    status: 'in_progress',
    reward: 'New running shoes'
  };

  // 5. Welcome Notification
  db.notifications[`${userId}-n1`] = {
    id: `${userId}-n1`,
    userId,
    title: 'Welcome to HabitFlow AI ✨',
    message: 'All tracking values are set to default zero. Complete your first habit today to start building your streak and watch your analytics come alive!',
    type: 'reminder',
    read: false,
    createdAt: new Date().toISOString()
  };

  // 6. Clean Welcome Chat from Coach
  db.chats[userId] = [
    {
      id: 'chat-welcome-clean',
      userId,
      role: 'assistant',
      content: `Hello ${userName}! 👋 I'm your **HabitFlow Coach**.\n\nWe have set all tracking values to **default zero** so you can experience building consistency from scratch!\n\n- **Current Streak**: 0 Days\n- **Completion Rate**: 0%\n- **Consistency Score**: 0 / 100\n\nWhen you check off your first habit on the dashboard, your score, streaks, and behavioral telemetry will begin calculating immediately. Which habit would you like to tackle first?`,
      timestamp: new Date().toISOString(),
      groundedFacts: [
        'Clean slate initialized',
        'Streaks: 0',
        'Consistency Score: 0/100'
      ]
    }
  ];
}

export function seedDemoData(
  db: DatabaseSchema,
  userId: string,
  userName: string = 'Abhishek',
  userEmail: string = 'iamabhishekadhikari20@gmail.com'
) {
  // 1. Create or update user
  db.users[userId] = {
    id: userId,
    name: userName,
    email: userEmail,
    onboardingCompleted: true,
    preferences: {
      theme: 'light',
      reminderTime: '08:00',
      focusAreas: ['Study', 'Fitness', 'Reading', 'Health', 'Meditation'],
      primaryObstacles: ['Lack of time', 'Low energy', 'Distractions'],
      weekStartsOn: 'monday',
      notificationsEnabled: true
    }
  };

  // 2. Define standard habits
  const defaultHabits: Omit<Habit, 'userId' | 'createdAt'>[] = [
    {
      id: `${userId}-h1`,
      name: 'Study DSA & Systems',
      description: 'Solve 1 LeetCode problem or study distributed systems concept',
      category: 'Study',
      frequency: 'daily',
      target: 60,
      targetUnit: 'minutes',
      preferredTime: '08:30',
      timeOfDay: 'morning',
      difficulty: 'hard',
      priority: 'high',
      startDate: getPastDate(70),
      active: true,
      color: '#3b82f6', // blue
      icon: 'BookOpen',
      streak: 12,
      bestStreak: 24
    },
    {
      id: `${userId}-h2`,
      name: 'Morning Workout',
      description: 'Cardio, strength training, or mobility sequence',
      category: 'Fitness',
      frequency: 'daily',
      target: 40,
      targetUnit: 'minutes',
      preferredTime: '07:15',
      timeOfDay: 'morning',
      difficulty: 'medium',
      priority: 'high',
      startDate: getPastDate(70),
      active: true,
      color: '#10b981', // emerald
      icon: 'Activity',
      streak: 4,
      bestStreak: 18
    },
    {
      id: `${userId}-h3`,
      name: 'Read Non-Fiction',
      description: 'Read high-signal books before winding down',
      category: 'Reading',
      frequency: 'daily',
      target: 20,
      targetUnit: 'pages',
      preferredTime: '21:00',
      timeOfDay: 'evening',
      difficulty: 'easy',
      priority: 'medium',
      startDate: getPastDate(70),
      active: true,
      color: '#8b5cf6', // purple
      icon: 'Bookmark',
      streak: 7,
      bestStreak: 16
    },
    {
      id: `${userId}-h4`,
      name: 'Mindful Meditation',
      description: 'Box breathing and awareness stillness',
      category: 'Meditation',
      frequency: 'daily',
      target: 10,
      targetUnit: 'minutes',
      preferredTime: '07:00',
      timeOfDay: 'morning',
      difficulty: 'easy',
      priority: 'medium',
      startDate: getPastDate(70),
      active: true,
      color: '#06b6d4', // cyan
      icon: 'Smile',
      streak: 5,
      bestStreak: 15
    },
    {
      id: `${userId}-h5`,
      name: 'Daily Hydration (3L)',
      description: 'Track daily water intake throughout daytime',
      category: 'Health',
      frequency: 'daily',
      target: 8,
      targetUnit: 'glasses',
      preferredTime: '12:00',
      timeOfDay: 'afternoon',
      difficulty: 'easy',
      priority: 'low',
      startDate: getPastDate(70),
      active: true,
      color: '#0284c7', // sky
      icon: 'Droplet',
      streak: 19,
      bestStreak: 32
    },
    {
      id: `${userId}-h6`,
      name: 'Evening Screen Detox',
      description: 'No laptops or phone doomscrolling 45 mins before sleep',
      category: 'Sleep',
      frequency: 'daily',
      target: 45,
      targetUnit: 'minutes',
      preferredTime: '22:15',
      timeOfDay: 'evening',
      difficulty: 'medium',
      priority: 'medium',
      startDate: getPastDate(70),
      active: true,
      color: '#f59e0b', // amber
      icon: 'Moon',
      streak: 2,
      bestStreak: 9
    }
  ];

  // Store habits
  for (const h of defaultHabits) {
    db.habits[h.id] = {
      ...h,
      userId,
      createdAt: getPastDate(70)
    };
  }

  // 3. Generate 60 days of historical logs with realistic behavioral patterns
  // Pattern 1: High completion on Mon/Tue/Wed, drops on Thursday/Friday
  // Pattern 2: Short sleep (< 6 hrs) triggers morning workout skips
  // Pattern 3: Evening habits decay due to "Too tired" or "No time"
  const skipReasons: SkipReason[] = [
    'No time',
    'Too tired',
    'Forgot',
    'Low motivation',
    'Busy',
    'Distraction'
  ];

  const daysToGenerate = 60;
  const now = new Date();

  for (let i = daysToGenerate; i >= 0; i--) {
    const logDate = new Date(now);
    logDate.setDate(logDate.getDate() - i);
    const dateStr = logDate.toISOString().split('T')[0];
    const dayOfWeek = logDate.getDay(); // 0 = Sun, 4 = Thu, etc.

    // Base mood and sleep for the day
    const isSleepDeprived = (i % 5 === 0) || (dayOfWeek === 4); // Thursdays often lower sleep
    const sleepHours = isSleepDeprived ? 5.2 : 7.4 + (i % 3) * 0.3;
    const energy = isSleepDeprived ? 2 : 4;
    const mood = isSleepDeprived ? 3 : 4;

    for (const habit of defaultHabits) {
      const logId = `log-${userId}-${habit.id}-${dateStr}`;
      
      // Calculate realistic status probability
      let isCompleted = true;
      let skipReason: SkipReason | undefined;

      // Behavioral dynamics:
      if (habit.id.endsWith('h2')) {
        // Morning workout
        if (sleepHours < 6) {
          isCompleted = false;
          skipReason = 'Too tired';
        } else if (dayOfWeek === 0 && i % 4 === 0) {
          isCompleted = false;
          skipReason = 'Busy';
        }
      } else if (habit.id.endsWith('h3') || habit.id.endsWith('h6')) {
        // Evening habits (Reading & Screen detox)
        if (dayOfWeek === 4 || dayOfWeek === 5) {
          // Thursday or Friday evening
          if (Math.random() < 0.45) {
            isCompleted = false;
            skipReason = 'No time';
          }
        }
      } else if (habit.id.endsWith('h1')) {
        // Study DSA
        if (dayOfWeek === 4) {
          // Thursday drop
          if (i % 2 === 0) {
            isCompleted = false;
            skipReason = 'Busy';
          }
        }
      } else if (habit.id.endsWith('h4')) {
        // Meditation
        if (Math.random() < 0.25) {
          isCompleted = false;
          skipReason = 'Forgot';
        }
      }

      // Today (i === 0) - make some already completed and some pending
      if (i === 0) {
        if (habit.id.endsWith('h1') || habit.id.endsWith('h2') || habit.id.endsWith('h5')) {
          isCompleted = true;
        } else {
          // Pending for today!
          continue;
        }
      }

      const status = isCompleted ? 'completed' : (Math.random() < 0.7 ? 'skipped' : 'missed');

      db.logs[logId] = {
        id: logId,
        habitId: habit.id,
        userId,
        date: dateStr,
        status,
        completedAt: isCompleted ? `${dateStr}T${habit.preferredTime || '09:00'}:00.000Z` : undefined,
        skipReason: !isCompleted ? skipReason || skipReasons[i % skipReasons.length] : undefined,
        mood,
        energy,
        sleepHours: Number(sleepHours.toFixed(1)),
        note: isCompleted
          ? (i % 7 === 0 ? 'Felt great momentum today!' : undefined)
          : (skipReason ? `Ran behind schedule due to ${skipReason.toLowerCase()}.` : undefined),
        createdAt: `${dateStr}T12:00:00.000Z`
      };
    }
  }

  // 4. Sample Goals
  db.goals[`${userId}-g1`] = {
    id: `${userId}-g1`,
    userId,
    name: '30-Day LeetCode & DSA Consistency Streak',
    habitId: `${userId}-h1`,
    targetDays: 30,
    completedDays: 22,
    startDate: getPastDate(30),
    endDate: getFutureDate(8),
    status: 'in_progress',
    reward: 'Purchase mechanical keyboard'
  };

  db.goals[`${userId}-g2`] = {
    id: `${userId}-g2`,
    userId,
    name: 'Establish 4-Day Weekly Workout Routine',
    habitId: `${userId}-h2`,
    targetDays: 24,
    completedDays: 19,
    startDate: getPastDate(40),
    endDate: getFutureDate(14),
    status: 'in_progress',
    reward: 'New running shoes'
  };

  // 5. Notifications
  db.notifications[`${userId}-n1`] = {
    id: `${userId}-n1`,
    userId,
    title: 'Streak at Risk 🔥',
    message: 'Your 7-day Read Non-Fiction streak is pending for today. Just 20 pages to keep it alive!',
    type: 'streak_risk',
    read: false,
    createdAt: new Date().toISOString()
  };

  db.notifications[`${userId}-n2`] = {
    id: `${userId}-n2`,
    userId,
    title: 'Weekly Behavioral Alert 🧠',
    message: 'Noticeable dip identified on Thursdays. We found shifting demanding tasks to morning boosted recovery by 34%.',
    type: 'behavioral_alert',
    read: false,
    createdAt: getPastDate(2)
  };

  // 6. Initial Welcome Chat from Coach
  db.chats[userId] = [
    {
      id: 'chat-welcome-1',
      userId,
      role: 'assistant',
      content: `Hello ${userName}! I'm your **HabitFlow Coach** 🧠. I've analyzed your past 60 days of habit tracking.\n\nHere is a quick behavioral observation:\n- **Strongest Habit**: **Daily Hydration (3L)** at 92% completion.\n- **Key Vulnerability**: **Thursdays** show a 31% completion drop compared to your Mondays, predominantly due to high workload and fatigue.\n- **Sleep Impact**: On days following <6 hours of sleep, morning workout completion drops to 44%.\n\nFeel free to ask me questions like *"Why am I inconsistent on Thursdays?"* or *"Which habit should I adjust first?"*`,
      timestamp: new Date().toISOString(),
      groundedFacts: [
        'Hydration rate: 92%',
        'Thursday drop: ~31%',
        'Sleep < 6 hrs correlates with 44% workout rate'
      ]
    }
  ];
}

function getPastDate(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split('T')[0];
}

function getFutureDate(daysAhead: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  return d.toISOString().split('T')[0];
}

// Public Database access methods
export const db = {
  getUser(userId: string): UserProfile | null {
    const data = ensureDbLoaded();
    return data.users[userId] || null;
  },

  upsertUser(user: UserProfile & { passwordHash?: string }): UserProfile {
    const data = ensureDbLoaded();
    data.users[user.id] = user;
    saveDb();
    return user;
  },

  getHabits(userId: string): Habit[] {
    const data = ensureDbLoaded();
    const todayStr = new Date().toISOString().split('T')[0];
    const userHabits = Object.values(data.habits).filter(h => h.userId === userId && h.active !== false);

    // Attach today's log if present
    return userHabits.map(h => {
      const todayLog = Object.values(data.logs).find(
        l => l.habitId === h.id && l.date === todayStr
      );
      return {
        ...h,
        todayLog: todayLog || null
      };
    });
  },

  getHabit(id: string): Habit | null {
    const data = ensureDbLoaded();
    return data.habits[id] || null;
  },

  createHabit(habit: Habit): Habit {
    const data = ensureDbLoaded();
    data.habits[habit.id] = habit;
    saveDb();
    return habit;
  },

  updateHabit(id: string, updates: Partial<Habit>): Habit | null {
    const data = ensureDbLoaded();
    if (!data.habits[id]) return null;
    data.habits[id] = { ...data.habits[id], ...updates };
    saveDb();
    return data.habits[id];
  },

  deleteHabit(id: string): boolean {
    const data = ensureDbLoaded();
    if (!data.habits[id]) return false;
    delete data.habits[id];
    saveDb();
    return true;
  },

  getLogs(userId: string, startDate?: string, endDate?: string): HabitLog[] {
    const data = ensureDbLoaded();
    let logs = Object.values(data.logs).filter(l => l.userId === userId);
    if (startDate) {
      logs = logs.filter(l => l.date >= startDate);
    }
    if (endDate) {
      logs = logs.filter(l => l.date <= endDate);
    }
    return logs.sort((a, b) => b.date.localeCompare(a.date));
  },

  logHabit(
    userId: string,
    habitId: string,
    date: string,
    status: 'completed' | 'skipped' | 'missed',
    details?: {
      skipReason?: SkipReason;
      mood?: number;
      energy?: number;
      sleepHours?: number;
      note?: string;
      value?: number;
    }
  ): HabitLog {
    const data = ensureDbLoaded();
    const id = `log-${userId}-${habitId}-${date}`;
    const log: HabitLog = {
      id,
      habitId,
      userId,
      date,
      status,
      completedAt: status === 'completed' ? new Date().toISOString() : undefined,
      skipReason: details?.skipReason,
      mood: details?.mood,
      energy: details?.energy,
      sleepHours: details?.sleepHours,
      note: details?.note,
      value: details?.value,
      createdAt: new Date().toISOString()
    };

    data.logs[id] = log;

    // Update habit streak dynamically
    const habit = data.habits[habitId];
    if (habit) {
      if (status === 'completed') {
        habit.streak = (habit.streak || 0) + 1;
        if (habit.streak > (habit.bestStreak || 0)) {
          habit.bestStreak = habit.streak;
        }
      } else if (status === 'missed' || status === 'skipped') {
        // If skipped/missed, streak resets
        habit.streak = 0;
      }
    }

    saveDb();
    return log;
  },

  removeLog(userId: string, habitId: string, date: string): boolean {
    const data = ensureDbLoaded();
    const id = `log-${userId}-${habitId}-${date}`;
    if (data.logs[id]) {
      delete data.logs[id];
      saveDb();
      return true;
    }
    return false;
  },

  getGoals(userId: string): Goal[] {
    const data = ensureDbLoaded();
    return Object.values(data.goals).filter(g => g.userId === userId);
  },

  createGoal(goal: Goal): Goal {
    const data = ensureDbLoaded();
    data.goals[goal.id] = goal;
    saveDb();
    return goal;
  },

  updateGoal(id: string, updates: Partial<Goal>): Goal | null {
    const data = ensureDbLoaded();
    if (!data.goals[id]) return null;
    data.goals[id] = { ...data.goals[id], ...updates };
    saveDb();
    return data.goals[id];
  },

  deleteGoal(id: string): boolean {
    const data = ensureDbLoaded();
    if (!data.goals[id]) return false;
    delete data.goals[id];
    saveDb();
    return true;
  },

  getNotifications(userId: string): NotificationItem[] {
    const data = ensureDbLoaded();
    return Object.values(data.notifications)
      .filter(n => n.userId === userId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  markNotificationRead(id: string): void {
    const data = ensureDbLoaded();
    if (data.notifications[id]) {
      data.notifications[id].read = true;
      saveDb();
    }
  },

  clearNotifications(userId: string): void {
    const data = ensureDbLoaded();
    for (const [id, notif] of Object.entries(data.notifications)) {
      if (notif.userId === userId) {
        delete data.notifications[id];
      }
    }
    saveDb();
  },

  getChats(userId: string): ChatMessage[] {
    const data = ensureDbLoaded();
    return data.chats[userId] || [];
  },

  addChat(userId: string, message: ChatMessage): void {
    const data = ensureDbLoaded();
    if (!data.chats[userId]) data.chats[userId] = [];
    data.chats[userId].push(message);
    saveDb();
  },

  resetToZero(userId: string, name?: string, email?: string): void {
    const data = ensureDbLoaded();
    for (const id of Object.keys(data.habits)) {
      if (data.habits[id].userId === userId) delete data.habits[id];
    }
    for (const id of Object.keys(data.logs)) {
      if (data.logs[id].userId === userId) delete data.logs[id];
    }
    for (const id of Object.keys(data.goals)) {
      if (data.goals[id].userId === userId) delete data.goals[id];
    }
    for (const id of Object.keys(data.notifications)) {
      if (data.notifications[id].userId === userId) delete data.notifications[id];
    }
    delete data.chats[userId];

    seedCleanZeroData(data, userId, name || 'Abhishek', email || 'iamabhishekadhikari20@gmail.com');
    saveDb();
  },

  resetDemoData(userId: string, name?: string, email?: string): void {
    const data = ensureDbLoaded();
    // Remove old records for this user
    for (const id of Object.keys(data.habits)) {
      if (data.habits[id].userId === userId) delete data.habits[id];
    }
    for (const id of Object.keys(data.logs)) {
      if (data.logs[id].userId === userId) delete data.logs[id];
    }
    for (const id of Object.keys(data.goals)) {
      if (data.goals[id].userId === userId) delete data.goals[id];
    }
    for (const id of Object.keys(data.notifications)) {
      if (data.notifications[id].userId === userId) delete data.notifications[id];
    }
    delete data.chats[userId];

    seedDemoData(data, userId, name || 'Abhishek', email || 'iamabhishekadhikari20@gmail.com');
    saveDb();
  }
};
