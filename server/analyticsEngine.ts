import {
  Habit,
  HabitLog,
  ConsistencyScoreBreakdown,
  AnalyticsOverview,
  DailyTrendPoint,
  HabitPerformanceItem,
  WeeklyTrendPoint,
  HeatmapDay,
  SkipReason,
  AIInsight
} from '../src/types';

export function calculateCompletionRate(logs: HabitLog[]): number {
  if (logs.length === 0) return 0;
  const completed = logs.filter(l => l.status === 'completed').length;
  return Math.round((completed / logs.length) * 100);
}

export function calculateHabitStreaks(habit: Habit, logs: HabitLog[], todayStr: string): { currentStreak: number; bestStreak: number } {
  // Sort logs descending by date
  const habitLogs = logs
    .filter(l => l.habitId === habit.id)
    .sort((a, b) => b.date.localeCompare(a.date));

  if (habitLogs.length === 0) return { currentStreak: 0, bestStreak: 0 };

  const logsByDate = new Map<string, HabitLog>();
  for (const log of habitLogs) {
    logsByDate.set(log.date, log);
  }

  // Calculate current streak starting from today or yesterday
  let currentStreak = 0;
  let cursor = new Date(todayStr);

  // Check if today is logged
  const todayLog = logsByDate.get(todayStr);
  if (!todayLog || todayLog.status !== 'completed') {
    // Check yesterday
    cursor.setDate(cursor.getDate() - 1);
  }

  while (true) {
    const dStr = cursor.toISOString().split('T')[0];
    const log = logsByDate.get(dStr);
    if (log && log.status === 'completed') {
      currentStreak++;
      cursor.setDate(cursor.getDate() - 1);
    } else {
      break;
    }
  }

  // Calculate best streak historically
  const sortedAsc = [...habitLogs].sort((a, b) => a.date.localeCompare(b.date));
  let maxStreak = 0;
  let tempStreak = 0;
  let prevDate: Date | null = null;

  for (const log of sortedAsc) {
    if (log.status === 'completed') {
      const curDate = new Date(log.date);
      if (!prevDate) {
        tempStreak = 1;
      } else {
        const diffDays = Math.round((curDate.getTime() - prevDate.getTime()) / (1000 * 3600 * 24));
        if (diffDays === 1) {
          tempStreak++;
        } else if (diffDays === 0) {
          // same day, ignore
        } else {
          tempStreak = 1;
        }
      }
      prevDate = curDate;
      if (tempStreak > maxStreak) {
        maxStreak = tempStreak;
      }
    }
  }

  return {
    currentStreak,
    bestStreak: Math.max(maxStreak, currentStreak, habit.bestStreak || 0)
  };
}

export function calculateConsistencyScore(
  habits: Habit[],
  logs: HabitLog[],
  periodDays: number = 30
): ConsistencyScoreBreakdown {
  if (habits.length === 0 || logs.length === 0) {
    return {
      score: 0,
      completionRateScore: 0,
      streakStabilityScore: 0,
      routineStabilityScore: 0,
      recoveryRateScore: 0,
      habitAdherenceScore: 0,
      levelLabel: 'Starting Fresh (0/100)',
      description: 'Zero habits logged yet. Complete your first habit today to start building momentum and calculate your Consistency Score!'
    };
  }

  // 1. Completion rate (0-100) -> 40% weight
  const compRate = calculateCompletionRate(logs);
  const completionRateScore = Math.min(100, Math.max(0, compRate));

  // 2. Streak stability (0-100) -> 20% weight
  // Ratio of habits with active streak >= 3 days vs total habits, plus avg streak length
  const streaks = habits.map(h => h.streak || 0);
  const avgStreak = streaks.reduce((a, b) => a + b, 0) / (streaks.length || 1);
  const activeStreakRatio = streaks.filter(s => s >= 3).length / (streaks.length || 1);
  const streakStabilityScore = Math.min(100, Math.round(activeStreakRatio * 60 + Math.min(avgStreak * 4, 40)));

  // 3. Routine stability (0-100) -> 20% weight
  // Variance across days of the week: low variance = high routine stability
  const dayTotals: { [key: number]: { completed: number; total: number } } = {
    0: { completed: 0, total: 0 },
    1: { completed: 0, total: 0 },
    2: { completed: 0, total: 0 },
    3: { completed: 0, total: 0 },
    4: { completed: 0, total: 0 },
    5: { completed: 0, total: 0 },
    6: { completed: 0, total: 0 }
  };

  for (const log of logs) {
    const day = new Date(log.date).getDay();
    dayTotals[day].total++;
    if (log.status === 'completed') dayTotals[day].completed++;
  }

  const dayRates = Object.values(dayTotals)
    .filter(d => d.total > 0)
    .map(d => (d.completed / d.total) * 100);

  let routineStabilityScore = dayRates.length > 0 ? 50 : 0;
  if (dayRates.length > 2) {
    const mean = dayRates.reduce((a, b) => a + b, 0) / dayRates.length;
    const variance = dayRates.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / dayRates.length;
    const stdDev = Math.sqrt(variance);
    // Lower standard deviation means more predictable routine
    routineStabilityScore = Math.min(100, Math.max(0, Math.round(100 - stdDev * 2.2)));
  }

  // 4. Recovery rate (0-100) -> 10% weight
  // When a habit was missed/skipped on day T, did user complete it on day T+1?
  let missedInstances = 0;
  let recoveredInstances = 0;

  const logsByHabit = new Map<string, HabitLog[]>();
  for (const log of logs) {
    if (!logsByHabit.has(log.habitId)) logsByHabit.set(log.habitId, []);
    logsByHabit.get(log.habitId)!.push(log);
  }

  for (const [_, hLogs] of logsByHabit.entries()) {
    hLogs.sort((a, b) => a.date.localeCompare(b.date));
    for (let i = 0; i < hLogs.length - 1; i++) {
      if (hLogs[i].status === 'missed' || hLogs[i].status === 'skipped') {
        missedInstances++;
        if (hLogs[i + 1].status === 'completed') {
          recoveredInstances++;
        }
      }
    }
  }

  const recoveryRateScore = missedInstances > 0
    ? Math.min(100, Math.round((recoveredInstances / missedInstances) * 100))
    : (compRate > 0 ? 70 : 0);

  // 5. Habit adherence (0-100) -> 10% weight
  // Adherence to target priorities (high priority habits weighted higher)
  const highPriorityHabitIds = new Set(habits.filter(h => h.priority === 'high').map(h => h.id));
  const highPriorityLogs = logs.filter(l => highPriorityHabitIds.has(l.habitId));
  const habitAdherenceScore = highPriorityLogs.length > 0
    ? calculateCompletionRate(highPriorityLogs)
    : compRate;

  // Formula as required:
  // Consistency Score = 40% completion rate + 20% streak stability + 20% routine stability + 10% recovery rate + 10% habit adherence
  const rawScore = Math.round(
    completionRateScore * 0.40 +
    streakStabilityScore * 0.20 +
    routineStabilityScore * 0.20 +
    recoveryRateScore * 0.10 +
    habitAdherenceScore * 0.10
  );

  const score = Math.max(0, Math.min(100, rawScore));

  let levelLabel = 'Building Stability';
  let description = 'Consistent effort detected. Focus on maintaining routine on transition days.';
  if (score >= 85) {
    levelLabel = 'High Consistency & Flow';
    description = 'Exceptional habit durability. High streak stability with swift next-day recovery.';
  } else if (score >= 70) {
    levelLabel = 'Steady Momentum';
    description = 'Solid daily execution. Targeted adjustments on high-workload days will unlock peak flow.';
  } else if (score >= 50) {
    levelLabel = 'Establishing Base';
    description = 'Early traction forming. Keep daily execution steady to lock in routine habits.';
  } else if (score > 0) {
    levelLabel = 'Initial Steps';
    description = 'Early habits logged. Complete daily habits to lift your score.';
  } else {
    levelLabel = 'Starting Fresh (0/100)';
    description = 'Zero habits logged yet. Complete your first habit today to start building momentum and calculate your Consistency Score!';
  }

  return {
    score,
    completionRateScore,
    streakStabilityScore,
    routineStabilityScore,
    recoveryRateScore,
    habitAdherenceScore,
    levelLabel,
    description
  };
}

export function generateAnalyticsOverview(
  habits: Habit[],
  logs: HabitLog[],
  range: string = '30d'
): AnalyticsOverview {
  const compRate = calculateCompletionRate(logs);
  const consistencyScore = calculateConsistencyScore(habits, logs);

  const currentStreak = Math.max(0, ...habits.map(h => h.streak || 0));
  const bestStreak = Math.max(0, ...habits.map(h => h.bestStreak || h.streak || 0));

  // Habit performance mapping
  const habitStats: { [id: string]: { completed: number; total: number; name: string; category: string } } = {};
  for (const h of habits) {
    habitStats[h.id] = { completed: 0, total: 0, name: h.name, category: h.category };
  }

  for (const log of logs) {
    if (habitStats[log.habitId]) {
      habitStats[log.habitId].total++;
      if (log.status === 'completed') habitStats[log.habitId].completed++;
    }
  }

  const habitRates = Object.values(habitStats)
    .filter(h => h.total > 0)
    .map(h => ({
      name: h.name,
      category: h.category,
      rate: Math.round((h.completed / h.total) * 100)
    }))
    .sort((a, b) => b.rate - a.rate);

  const strongestHabit = habitRates.length > 0 ? habitRates[0] : null;
  const weakestHabit = habitRates.length > 0 ? habitRates[habitRates.length - 1] : null;

  // Time of day analysis
  // Morning habits vs evening habits
  const morningHabitIds = new Set(
    habits
      .filter(h => h.timeOfDay === 'morning' || (h.preferredTime && h.preferredTime < '12:00'))
      .map(h => h.id)
  );
  const eveningHabitIds = new Set(
    habits
      .filter(h => h.timeOfDay === 'evening' || (h.preferredTime && h.preferredTime >= '18:00'))
      .map(h => h.id)
  );

  const morningLogs = logs.filter(l => morningHabitIds.has(l.habitId));
  const eveningLogs = logs.filter(l => eveningHabitIds.has(l.habitId));

  const morningCompletionRate = morningLogs.length > 0 ? calculateCompletionRate(morningLogs) : 0;
  const eveningCompletionRate = eveningLogs.length > 0 ? calculateCompletionRate(eveningLogs) : 0;

  // Top skip reasons
  const reasonCounts: { [key in SkipReason]?: number } = {};
  let totalSkippedOrMissed = 0;

  for (const log of logs) {
    if (log.skipReason) {
      reasonCounts[log.skipReason] = (reasonCounts[log.skipReason] || 0) + 1;
      totalSkippedOrMissed++;
    }
  }

  const topSkipReasons = Object.entries(reasonCounts)
    .map(([reason, count]) => ({
      reason: reason as SkipReason,
      count: count || 0,
      percentage: totalSkippedOrMissed > 0 ? Math.round(((count || 0) / totalSkippedOrMissed) * 100) : 0
    }))
    .sort((a, b) => b.count - a.count);

  // Day of week patterns
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayPatterns = [0, 1, 2, 3, 4, 5, 6].map(dayIndex => {
    const dayLogs = logs.filter(l => new Date(l.date).getDay() === dayIndex);
    const completed = dayLogs.filter(l => l.status === 'completed').length;
    const total = dayLogs.length;
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
    return {
      day: dayNames[dayIndex],
      dayIndex,
      rate,
      total,
      completed
    };
  });

  // Sleep correlation
  const logsWithSleep = logs.filter(l => l.sleepHours !== undefined && l.sleepHours !== null);
  const under6 = logsWithSleep.filter(l => (l.sleepHours || 0) < 6);
  const between6and8 = logsWithSleep.filter(l => (l.sleepHours || 0) >= 6 && (l.sleepHours || 0) <= 8);
  const over8 = logsWithSleep.filter(l => (l.sleepHours || 0) > 8);

  const under6Rate = under6.length > 0 ? calculateCompletionRate(under6) : 0;
  const between6and8Rate = between6and8.length > 0 ? calculateCompletionRate(between6and8) : 0;
  const over8Rate = over8.length > 0 ? calculateCompletionRate(over8) : 0;

  // Energy correlation
  const logsWithEnergy = logs.filter(l => l.energy !== undefined && l.energy !== null);
  const lowEnergy = logsWithEnergy.filter(l => (l.energy || 0) < 3);
  const highEnergy = logsWithEnergy.filter(l => (l.energy || 0) >= 3);

  const lowEnergyRate = lowEnergy.length > 0 ? calculateCompletionRate(lowEnergy) : 0;
  const highEnergyRate = highEnergy.length > 0 ? calculateCompletionRate(highEnergy) : 0;

  return {
    range,
    totalHabits: habits.length,
    totalLogged: logs.length,
    overallCompletionRate: compRate,
    currentStreak,
    bestStreak,
    consistencyScore,
    strongestHabit,
    weakestHabit,
    morningCompletionRate,
    eveningCompletionRate,
    topSkipReasons,
    dayOfWeekPatterns: dayPatterns,
    sleepCorrelation: {
      under6HoursRate: under6Rate,
      between6and8HoursRate: between6and8Rate,
      over8HoursRate: over8Rate,
      dropPercentage: Math.max(0, between6and8Rate - under6Rate)
    },
    energyCorrelation: {
      lowEnergyRate,
      highEnergyRate,
      dropPercentage: Math.max(0, highEnergyRate - lowEnergyRate)
    }
  };
}

export function generateDailyTrend(logs: HabitLog[], days: number = 14): DailyTrendPoint[] {
  const dateMap = new Map<string, HabitLog[]>();
  const now = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dStr = d.toISOString().split('T')[0];
    dateMap.set(dStr, []);
  }

  for (const log of logs) {
    if (dateMap.has(log.date)) {
      dateMap.get(log.date)!.push(log);
    }
  }

  const result: DailyTrendPoint[] = [];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  for (const [date, dayLogs] of dateMap.entries()) {
    const d = new Date(date);
    const scheduled = dayLogs.length;
    const completed = dayLogs.filter(l => l.status === 'completed').length;
    const rate = scheduled > 0 ? Math.round((completed / scheduled) * 100) : 0;

    const energyLogs = dayLogs.filter(l => l.energy !== undefined && l.energy !== null);
    const avgEnergy = energyLogs.length > 0
      ? Number((energyLogs.reduce((acc, l) => acc + (l.energy || 0), 0) / energyLogs.length).toFixed(1))
      : undefined;

    const sleepLogs = dayLogs.filter(l => l.sleepHours !== undefined && l.sleepHours !== null);
    const avgSleep = sleepLogs.length > 0
      ? Number((sleepLogs.reduce((acc, l) => acc + (l.sleepHours || 0), 0) / sleepLogs.length).toFixed(1))
      : undefined;

    result.push({
      date,
      dayName: dayNames[d.getDay()],
      rate,
      completed,
      scheduled,
      energy: avgEnergy,
      sleep: avgSleep
    });
  }

  return result;
}

export function generateHabitPerformance(habits: Habit[], logs: HabitLog[]): HabitPerformanceItem[] {
  return habits.map(h => {
    const hLogs = logs.filter(l => l.habitId === h.id);
    const completed = hLogs.filter(l => l.status === 'completed').length;
    const skipped = hLogs.filter(l => l.status === 'skipped').length;
    const missed = hLogs.filter(l => l.status === 'missed').length;
    const total = hLogs.length;
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
      habitId: h.id,
      name: h.name,
      category: h.category,
      icon: h.icon,
      color: h.color,
      rate,
      completed,
      skipped,
      missed,
      currentStreak: h.streak || 0,
      bestStreak: h.bestStreak || h.streak || 0
    };
  }).sort((a, b) => b.rate - a.rate);
}

export function generateHeatmap(logs: HabitLog[], totalHabitsCount: number, daysBack: number = 84): HeatmapDay[] {
  const result: HeatmapDay[] = [];
  const now = new Date();
  const logsByDate = new Map<string, HabitLog[]>();

  for (const log of logs) {
    if (!logsByDate.has(log.date)) logsByDate.set(log.date, []);
    logsByDate.get(log.date)!.push(log);
  }

  for (let i = daysBack - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dStr = d.toISOString().split('T')[0];

    const dayLogs = logsByDate.get(dStr) || [];
    const count = dayLogs.length;
    const completed = dayLogs.filter(l => l.status === 'completed').length;
    const missed = dayLogs.filter(l => l.status === 'missed' || l.status === 'skipped').length;
    const rate = count > 0 ? Math.round((completed / count) * 100) : 0;

    let intensity: 0 | 1 | 2 | 3 | 4 = 0;
    if (rate > 80) intensity = 4;
    else if (rate > 60) intensity = 3;
    else if (rate > 35) intensity = 2;
    else if (rate > 0) intensity = 1;

    result.push({
      date: dStr,
      completionRate: rate,
      intensity,
      count,
      completed,
      missed
    });
  }

  return result;
}

export function generateRuleBasedInsights(overview: AnalyticsOverview, habits: Habit[]): AIInsight[] {
  const insights: AIInsight[] = [];

  if (overview.totalLogged === 0) {
    return [
      {
        id: 'insight-fresh-start',
        badge: 'Opportunity',
        title: 'Starting from Scratch (0 Data Points)',
        evidence: 'Zero habit logs recorded so far. Consistency score, completion rates, and streaks are set to default 0.',
        possibleReason: 'Starting clean lets you track genuine progress day-by-day with zero bias.',
        actionableRecommendation: 'Check off your first habit on the Today dashboard to start generating real-time behavioral insights and streaks.',
        impactScore: 10,
        category: 'Habit Design',
        createdAt: new Date().toISOString()
      }
    ];
  }

  // Insight 1: Energy vs Completion drop
  if (overview.energyCorrelation.dropPercentage > 15) {
    insights.push({
      id: 'insight-energy-drop',
      badge: 'Pattern detected',
      title: 'Energy Sensitivity Threshold',
      evidence: `Your habit completion drops by ${overview.energyCorrelation.dropPercentage}% on days when your energy score is below 3 (${overview.energyCorrelation.lowEnergyRate}% vs ${overview.energyCorrelation.highEnergyRate}%).`,
      possibleReason: 'High cognitive friction on demanding habits causes postponement when baseline physiological energy is depleted.',
      actionableRecommendation: 'Define a "low-energy minimum" (e.g. 10 minutes instead of 45 minutes) so you keep the daily streak alive without triggering task paralysis.',
      impactScore: 9,
      category: 'Physiological',
      createdAt: new Date().toISOString()
    });
  }

  // Insight 2: Time of Day disparity
  if (overview.morningCompletionRate - overview.eveningCompletionRate > 20) {
    insights.push({
      id: 'insight-evening-decay',
      badge: 'Routine Bottleneck',
      title: 'Evening Habit Completion Decay',
      evidence: `You complete ${overview.morningCompletionRate}% of habits scheduled in the morning, but only ${overview.eveningCompletionRate}% of habits scheduled after 6:00 PM.`,
      possibleReason: 'Decision fatigue accumulates through the day; late habits compete with unplanned overtime and unwinding routines.',
      actionableRecommendation: 'Shift your most mentally demanding habits (such as Study or Reading) forward to before 7:30 PM.',
      impactScore: 8,
      category: 'Chronobiology',
      createdAt: new Date().toISOString()
    });
  }

  // Insight 3: Day of Week drop
  const sortedDays = [...overview.dayOfWeekPatterns].sort((a, b) => a.rate - b.rate);
  const worstDay = sortedDays[0];
  const bestDay = sortedDays[sortedDays.length - 1];

  if (bestDay.rate - worstDay.rate > 20) {
    const topReason = overview.topSkipReasons[0]?.reason || 'schedule overload';
    insights.push({
      id: 'insight-day-drop',
      badge: 'Pattern detected',
      title: `Consistency Drop on ${worstDay.day}s`,
      evidence: `Completion on ${worstDay.day}s averages ${worstDay.rate}%, compared to ${bestDay.day}s at ${bestDay.rate}%.`,
      possibleReason: `Data indicates repeated '${topReason}' tags on ${worstDay.day}s, pointing to structural schedule congestion.`,
      actionableRecommendation: `Protect a 30-minute block on ${worstDay.day} mornings before external demands overtake your personal momentum.`,
      impactScore: 8,
      category: 'Weekly Rhythm',
      createdAt: new Date().toISOString()
    });
  }

  // Insight 4: Sleep correlation
  if (overview.sleepCorrelation.dropPercentage > 15) {
    insights.push({
      id: 'insight-sleep-impact',
      badge: 'High Impact',
      title: 'Sleep Deficit Friction',
      evidence: `Completion drops by ${overview.sleepCorrelation.dropPercentage}% following nights with under 6 hours of sleep (${overview.sleepCorrelation.under6HoursRate}% vs ${overview.sleepCorrelation.between6and8HoursRate}%).`,
      possibleReason: 'Sleep debt impairs executive function and willpower reserves needed to initiate deliberate tasks.',
      actionableRecommendation: 'On days following short sleep, prioritize your single highest-priority habit first thing and allow rest.',
      impactScore: 9,
      category: 'Recovery',
      createdAt: new Date().toISOString()
    });
  }

  // Insight 5: Weakest habit suggestion
  if (overview.weakestHabit && overview.weakestHabit.rate < 60) {
    insights.push({
      id: 'insight-weakest-habit',
      badge: 'Opportunity',
      title: `Micro-Dose "${overview.weakestHabit.name}"`,
      evidence: `"${overview.weakestHabit.name}" has the lowest adherence (${overview.weakestHabit.rate}%) across the measured window.`,
      possibleReason: 'The habit initiation threshold may feel too intimidating during busy weekdays.',
      actionableRecommendation: `Cut the target in half for the next 7 days. Consistency in frequency is 10x more valuable than high volume when cementing a new pattern.`,
      impactScore: 7,
      category: 'Habit Design',
      createdAt: new Date().toISOString()
    });
  }

  return insights;
}
