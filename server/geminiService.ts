import { GoogleGenAI } from '@google/genai';
import { AnalyticsOverview, Habit, AIInsight } from '../src/types';
import { generateRuleBasedInsights } from './analyticsEngine';

let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });
  }
  return aiClient;
}

export async function generateGeminiInsights(
  overview: AnalyticsOverview,
  habits: Habit[],
  userName: string
): Promise<AIInsight[]> {
  const fallback = generateRuleBasedInsights(overview, habits);
  const ai = getAiClient();
  if (!ai) {
    return fallback;
  }

  const structuredContext = {
    userName,
    completionRate: overview.overallCompletionRate,
    currentStreak: overview.currentStreak,
    bestStreak: overview.bestStreak,
    strongestHabit: overview.strongestHabit,
    weakestHabit: overview.weakestHabit,
    morningCompletion: overview.morningCompletionRate,
    eveningCompletion: overview.eveningCompletionRate,
    topSkipReasons: overview.topSkipReasons.slice(0, 4),
    dayOfWeekPatterns: overview.dayOfWeekPatterns,
    sleepCorrelation: overview.sleepCorrelation,
    energyCorrelation: overview.energyCorrelation,
    consistencyScore: overview.consistencyScore.score
  };

  const systemInstruction = `You are HabitFlow Coach, an expert behavioral scientist, data analyst, and supportive habit coach.
Analyze the user's structured habit analytics to identify genuine behavioral patterns and inconsistency root causes.
Rules:
1. Ground every claim strictly in the user's numbers. Do NOT invent stats or assume causation.
2. Use careful phrasing: "Your data suggests...", "Possible pattern...", "Correlates with...".
3. Never shame or judge the user. Be encouraging, analytical, and practical.
4. Provide concrete, micro-actionable adjustments (e.g. adjust target size, chronobiology adjustments, morning shifting).
5. Output valid JSON adhering to the specified schema.`;

  const prompt = `Here is the user's verified historical habit analytics:
${JSON.stringify(structuredContext, null, 2)}

Generate 4 to 5 deep, high-impact behavioral insights answering: "Why is the user losing consistency, and what specific change will fix it?"
Format each insight with:
- id: string
- title: string (short, punchy)
- badge: one of "Pattern detected", "High Impact", "Routine Bottleneck", "Strength", "Opportunity"
- evidence: string (quote exact numbers from context)
- possibleReason: string (behavioral friction explanation)
- actionableRecommendation: string (practical tweak)
- impactScore: number (1 to 10)
- category: string (e.g. "Chronobiology", "Recovery", "Habit Design", "Workload Rhythm")

Return a JSON array of these insight objects.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.7,
        responseMimeType: 'application/json'
      }
    });

    const text = response.text;
    if (text) {
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((item: any, idx: number) => ({
          id: item.id || `ai-insight-${idx}-${Date.now()}`,
          title: item.title || 'Behavioral Observation',
          badge: item.badge || 'Pattern detected',
          evidence: item.evidence || '',
          possibleReason: item.possibleReason || '',
          actionableRecommendation: item.actionableRecommendation || '',
          impactScore: Number(item.impactScore) || 8,
          category: item.category || 'Behavioral',
          createdAt: new Date().toISOString()
        }));
      }
    }
    return fallback;
  } catch (error) {
    console.error('Gemini Insights generation fallback triggered:', error);
    return fallback;
  }
}

export async function chatWithHabitCoach(
  userQuestion: string,
  overview: AnalyticsOverview,
  habits: Habit[],
  userName: string,
  recentChatHistory: { role: string; content: string }[]
): Promise<{ text: string; groundedFacts: string[] }> {
  const ai = getAiClient();

  const facts = [
    `Overall Completion Rate: ${overview.overallCompletionRate}%`,
    `Current Streak: ${overview.currentStreak} days (Best: ${overview.bestStreak} days)`,
    `Consistency Score: ${overview.consistencyScore.score}/100 (${overview.consistencyScore.levelLabel})`,
    `Morning Rate: ${overview.morningCompletionRate}% vs Evening Rate: ${overview.eveningCompletionRate}%`,
    `Strongest Habit: ${overview.strongestHabit ? `${overview.strongestHabit.name} (${overview.strongestHabit.rate}%)` : 'N/A'}`,
    `Weakest Habit: ${overview.weakestHabit ? `${overview.weakestHabit.name} (${overview.weakestHabit.rate}%)` : 'N/A'}`,
    `Top Skip Reason: ${overview.topSkipReasons[0]?.reason || 'None'} (${overview.topSkipReasons[0]?.count || 0} times)`,
    `Low Energy (<3) Drop: ${overview.energyCorrelation.dropPercentage}% drop in completion`,
    `Sleep (<6h) Drop: ${overview.sleepCorrelation.dropPercentage}% drop in completion`
  ];

  if (!ai) {
    // Rule-based high quality response when API key is not yet set
    const q = userQuestion.toLowerCase();
    let responseText = '';

    if (q.includes('inconsistent') || q.includes('why') || q.includes('losing')) {
      responseText = `Based on your past records, **${userName}**, here is what the data indicates:

1. **Energy Sensitivity**: Your completion rate falls by **${overview.energyCorrelation.dropPercentage}%** on days where your energy is below 3 (${overview.energyCorrelation.lowEnergyRate}% vs ${overview.energyCorrelation.highEnergyRate}%).
2. **Evening Decay**: Morning habits achieve **${overview.morningCompletionRate}%** completion, whereas evening habits drop to **${overview.eveningCompletionRate}%**.
3. **Primary Blocker**: Your most reported skip reason is **"${overview.topSkipReasons[0]?.reason || 'No time'}"** (${overview.topSkipReasons[0]?.percentage || 30}% of missed logs).

**Recommended Step**: Shift your high-difficulty habits earlier in the day and define a 10-minute fallback version for low-energy evenings.`;
    } else if (q.includes('strong') || q.includes('best')) {
      responseText = `Your strongest habit is **${overview.strongestHabit?.name || 'Daily Hydration'}** with a **${overview.strongestHabit?.rate || 90}%** completion rate. You have built rock-solid routine stability here. Keep leveraging this as an anchor habit!`;
    } else if (q.includes('weak') || q.includes('change') || q.includes('worst')) {
      responseText = `Your habit needing the most attention is **${overview.weakestHabit?.name || 'Evening Reading'}** at **${overview.weakestHabit?.rate || 48}%** completion. Instead of fighting fatigue, try micro-dosing this habit to 5-10 minutes right after dinner rather than right before bed.`;
    } else {
      responseText = `Hello ${userName}! Looking at your verified tracker data:
- **Consistency Score**: **${overview.consistencyScore.score}/100**
- **Completion Rate**: **${overview.overallCompletionRate}%**
- **Active Streak**: **${overview.currentStreak} days**

Your morning routine is functioning with high adherence (${overview.morningCompletionRate}%), while your primary drop-off occurs on ${overview.dayOfWeekPatterns.sort((a,b)=>a.rate-b.rate)[0]?.day || 'Thursdays'}. Would you like recommendations on how to structure low-energy days?`;
    }

    return { text: responseText, groundedFacts: facts };
  }

  const systemInstruction = `You are HabitFlow Coach, an intelligent, empathetic behavioral scientist and AI assistant for HabitFlow AI.
The user is asking questions about their personal habits and consistency.
You must ground your answers STRICTLY in the provided user metrics below.
Never make up facts, numbers, or activities not listed in the data.
Format your answer with concise markdown, bullet points, and actionable takeaways.

Verified User Metrics:
${facts.join('\n')}
Active Habits:
${habits.map(h => `- ${h.name} (${h.category}, Target: ${h.target} ${h.targetUnit}, Streak: ${h.streak}d, Time: ${h.preferredTime || h.timeOfDay})`).join('\n')}`;

  const prompt = `User question: "${userQuestion}"
Respond thoughtfully and analytically to the user based directly on their habit numbers.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.6
      }
    });

    return {
      text: response.text || 'I analyzed your habit data, but could not generate a response. Please try again.',
      groundedFacts: facts
    };
  } catch (err: any) {
    console.error('Gemini chat error:', err);
    return {
      text: `I'm analyzing your data locally: Your current completion rate is ${overview.overallCompletionRate}%, with a consistency score of ${overview.consistencyScore.score}/100. Your strongest anchor is ${overview.strongestHabit?.name || 'Morning Workout'} (${overview.strongestHabit?.rate}%).`,
      groundedFacts: facts
    };
  }
}
