'use client';

export function useAnalysePlanProgress() {
  const getProgressAnalysis = async (prompt: string, startDate: string, endDate: string, currentDay: number) => {
    try {
      const apiUrl = 'https://moole-back.vercel.app/ask-moole';
      const systemPrompt = `You are a helpful fitness and nutrition coach that provides personalized progress analysis. 
      You analyze the user's fitness plan and give insights on:
      - What they've accomplished so far
      - What they need to focus on today
      - What's coming next in their plan
      - Encouragement and tips
      
      Keep the response conversational, supportive, and actionable.`;
      
      const userPrompt = `Analyze my fitness plan: ${prompt}
      
      Plan started on: ${startDate}
      Plan ends on: ${endDate}
      Current day of plan: ${currentDay}
      
      Provide a progress analysis with:
      1. What I've accomplished so far
      2. Today's focus and tasks
      3. What's coming up next
      4. Encouragement and tips`;
      
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: `${systemPrompt}\n\n${userPrompt}` }),
      });
      
      if (!res.ok) throw new Error('Failed to get progress analysis');
      const data = await res.json();
      return data.answer || 'Keep up the great work!';
    } catch (error) {
      console.error('Error getting progress analysis:', error);
      return 'Keep pushing forward! Your hard work is paying off.';
    }
  };

  return { getProgressAnalysis };
}
