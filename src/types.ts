export type Frequency = 'daily' | 'weekdays' | 'weekends' | 'custom';
export type Difficulty = 'easy' | 'medium' | 'hard';
export type Priority = 'low' | 'medium' | 'high';
export type HabitStatus = 'completed' | 'skipped' | 'missed' | 'pending';

export type SkipReason =
  | 'No time'
  | 'Forgot'
  | 'Too tired'
  | 'Low motivation'
  | 'Busy'
  | 'Not feeling well'
  | 'Habit was too difficult'
  | 'Unexpected event'
  | 'Distraction'
  | 'Other';

export interface Habit {
  id: string;
  userId: string;
  name: string;
  description?: string;
  category: string;
  frequency: Frequency;
  customDays?: number[]; // 0 = Sun, 1 = Mon ...
  target: number;
  targetUnit: string; // e.g. "minutes", "pages", "glasses", "times"
  preferredTime?: string; // e.g. "07:30", "19:00"
  timeOfDay?: 'morning' | 'afternoon' | 'evening';
  reminderTime?: string;
  difficulty: Difficulty;
  priority: Priority;
  startDate: string; // YYYY-MM-DD
  active: boolean;
  color: string;
  icon: string;
  streak: number;
  bestStreak: number;
  createdAt: string;
  todayLog?: HabitLog | null;
}

export interface HabitLog {
  id: string;
  habitId: string;
  userId: string;
  date: string; // YYYY-MM-DD
  status: HabitStatus;
  completedAt?: string; // ISO string
  value?: number;
  skipReason?: SkipReason;
  mood?: number; // 1-5
  energy?: number; // 1-5
  sleepHours?: number; // e.g. 7.5
  note?: string;
  environment?: string;
  createdAt: string;
}

export interface DailyMetric {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  totalScheduled: number;
  totalCompleted: number;
  totalSkipped: number;
  totalMissed: number;
  completionRate: number; // 0-100
  avgMood?: number;
  avgEnergy?: number;
  avgSleepHours?: number;
}

export interface Goal {
  id: string;
  userId: string;
  name: string;
  habitId?: string;
  targetDays: number;
  completedDays: number;
  startDate: string;
  endDate?: string;
  status: 'in_progress' | 'completed' | 'paused';
  reward?: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'streak_risk' | 'reminder' | 'milestone' | 'weekly_summary' | 'behavioral_alert';
  read: boolean;
  createdAt: string;
}

export interface ConsistencyScoreBreakdown {
  score: number; // 0-100 overall
  completionRateScore: number; // 40% weight
  streakStabilityScore: number; // 20% weight
  routineStabilityScore: number; // 20% weight
  recoveryRateScore: number; // 10% weight
  habitAdherenceScore: number; // 10% weight
  levelLabel: string; // e.g. "Optimal Momentum", "Building Stability"
  description: string;
}

export interface AnalyticsOverview {
  range: string; // "7d" | "30d" | "90d" | "6m" | "1y"
  totalHabits: number;
  totalLogged: number;
  overallCompletionRate: number;
  currentStreak: number;
  bestStreak: number;
  consistencyScore: ConsistencyScoreBreakdown;
  strongestHabit: { name: string; rate: number; category: string } | null;
  weakestHabit: { name: string; rate: number; category: string } | null;
  morningCompletionRate: number;
  eveningCompletionRate: number;
  topSkipReasons: { reason: SkipReason; count: number; percentage: number }[];
  dayOfWeekPatterns: { day: string; dayIndex: number; rate: number; total: number; completed: number }[];
  sleepCorrelation: {
    under6HoursRate: number;
    between6and8HoursRate: number;
    over8HoursRate: number;
    dropPercentage: number;
  };
  energyCorrelation: {
    lowEnergyRate: number; // energy < 3
    highEnergyRate: number; // energy >= 3
    dropPercentage: number;
  };
}

export interface DailyTrendPoint {
  date: string;
  dayName: string;
  rate: number;
  completed: number;
  scheduled: number;
  energy?: number;
  sleep?: number;
}

export interface HabitPerformanceItem {
  habitId: string;
  name: string;
  category: string;
  icon: string;
  color: string;
  rate: number;
  completed: number;
  skipped: number;
  missed: number;
  currentStreak: number;
  bestStreak: number;
}

export interface WeeklyTrendPoint {
  weekLabel: string;
  startDate: string;
  rate: number;
  completed: number;
  total: number;
}

export interface HeatmapDay {
  date: string;
  completionRate: number; // 0 to 100
  intensity: 0 | 1 | 2 | 3 | 4; // for heatmap shading
  count: number;
  completed: number;
  missed: number;
}

export interface AIInsight {
  id: string;
  title: string;
  badge: 'Pattern detected' | 'High Impact' | 'Routine Bottleneck' | 'Strength' | 'Opportunity';
  evidence: string;
  possibleReason: string;
  actionableRecommendation: string;
  impactScore: number; // 1-10
  category: string;
  createdAt: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  onboardingCompleted: boolean;
  preferences: {
    theme: 'light' | 'dark' | 'system';
    reminderTime: string;
    focusAreas: string[];
    primaryObstacles: string[];
    weekStartsOn: 'monday' | 'sunday';
    notificationsEnabled: boolean;
  };
}
