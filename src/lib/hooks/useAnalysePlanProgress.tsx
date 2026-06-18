'use client';

export function useAnalysePlanProgress() {
  const getProgressAnalysis = async (
    prompt: string,
    startDate: string,
    endDate: string,
    currentDay: number,
    metricsSummary?: string
  ): Promise<string> => {
    const systemPrompt = `You are a helpful fitness and nutrition coach that provides personalized progress analysis. 
You analyze the user's fitness plan and their logged activity metrics to give insights on:
- What they've accomplished so far based on their real logged data
- What they need to focus on today
- What's coming next in their plan
- Encouragement and tips

When logged metrics are provided, reference specific numbers (weight, distance, pace, time) in your analysis.
Keep the response conversational, supportive, and actionable.`;

    const userPrompt = `Analyze my fitness plan: ${prompt}

Plan started on: ${startDate}
Plan ends on: ${endDate}
Current day of plan: ${currentDay}

${metricsSummary ? `My logged activity data from the database:\n${metricsSummary}\n` : 'No activity metrics logged yet.\n'}

Provide a progress analysis with:
1. What I've accomplished so far (use my logged metrics when available)
2. Today's focus and tasks
3. What's coming up next
4. Encouragement and tips`;

    try {
      const res = await fetch('/api/ai/analyse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: `${systemPrompt}\n\n${userPrompt}` }),
      });

      if (!res.ok) {
        console.error('AI analyse route returned', res.status);
        return 'Keep pushing forward! Your hard work is paying off.';
      }

      const data = await res.json();
      return data.answer ?? 'Keep up the great work!';
    } catch (error) {
      console.error('Error getting progress analysis:', error);
      return 'Keep pushing forward! Your hard work is paying off.';
    }
  };

  return { getProgressAnalysis };
}
