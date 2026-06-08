'use client';

import { useState, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '@/lib/redux/hooks';
import {
  setGeneratedPlan,
  setIsGenerating,
  setGenerationError,
  setPlanItemLoadingState,
} from '@/lib/redux/slices/planSlice';
import type { GeneratedPlan } from '@/lib/types/plan';
import mockPlan from '@/lib/mock-data/mock-plan.json';

const filterResponse = (response: string): string => {
  return response.replace(/```json|```|\\n/g, '').trim();
};

const safelyParseJSON = (jsonString: string) => {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('Failed to parse JSON plan response:', error);
    return null;
  }
};

const useMakePlan = (userPrompt: string, autoRun = false) => {
  const dispatch = useAppDispatch();
  const { isGenerating } = useAppSelector((state) => state.plan);

  const [resetState, setResetState] = useState(false);

  // Helper to simulate sequential plan item loading
  const simulatePlanItemLoading = async () => {
    for (let i = 0; i < 6; i++) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      dispatch(setPlanItemLoadingState({ index: i, isLoading: false }));
    }
  };

  const askAI = async (prompt: string): Promise<{ answer: string | null; error: string | null }> => {
    try {
      dispatch(setIsGenerating(true));
      dispatch(setGenerationError(null));

      // Use proxy endpoint
      const apiUrl = 'https://moole-back.vercel.app/ask-moole';
      
      // For testing: use mock data if proxy endpoint fails (fallback)
      const useMockData = false; // Set to true if you want to use mock data directly
      if (useMockData) {
        console.log('Using mock plan data (fallback mode)');
        await new Promise((resolve) => setTimeout(resolve, 2000));
        const mockGeneratedPlan: GeneratedPlan = {
          meals: mockPlan.planTypes[0].tableData,
          cardio: mockPlan.planTypes[1].tableData,
          nutrients: mockPlan.planTypes[2].tableData,
          recommended: mockPlan.planTypes[3].tableData,
          challenges: mockPlan.planTypes[4].tableData,
          supplements: mockPlan.planTypes[5].tableData,
        };
        dispatch(setGeneratedPlan(mockGeneratedPlan));
        await simulatePlanItemLoading();
        return { answer: JSON.stringify(mockGeneratedPlan), error: null };
      }

      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: prompt,
        }),
      });

      if (!res.ok) {
        const errorData = await res.text();
        console.error('Proxy API error:', res.status, errorData);
        throw new Error(`Failed to get plan from AI: ${res.status} ${res.statusText}`);
      }

      const data = await res.json();
      if (data.error) {
        throw new Error(data.error);
      }

      const answer = data.answer;

      if (answer) {
        const filtered = filterResponse(answer);
        const parsedPlan: GeneratedPlan | null = safelyParseJSON(filtered);

        if (parsedPlan) {
          dispatch(setGeneratedPlan(parsedPlan));
        } else {
          console.error('Failed to parse plan:', answer);
          throw new Error('Failed to parse plan from AI. Please try again.');
        }
      }

      dispatch(setIsGenerating(false));
      await simulatePlanItemLoading();
      return { answer: answer || null, error: null };
    } catch (err: unknown) {
      dispatch(setIsGenerating(false));
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      dispatch(setGenerationError(errorMessage));
      console.error('useMakePlan error:', err);
      return { answer: null, error: errorMessage };
    }
  };

  const generatePlan = async () => {
    if (!userPrompt.trim()) {
      dispatch(setGenerationError('Please enter a prompt to generate a plan'));
      return;
    }

    // Combine system instruction and user prompt into one question for proxy
    const systemPrompt = `You are a fitness and nutrition expert that generates comprehensive, structured plans. You ONLY respond with valid JSON, no extra text, no markdown, just clean JSON.`;
    const prompt = `${systemPrompt}

Generate a comprehensive fitness and nutrition plan based on this user request: ${userPrompt}

Return ONLY a JSON object in the following exact format, no extra characters, no text, no markdown, just JSON:
{
  "meals": [
    { "id": "1", "columns": ["Breakfast", "08:00", "Details with protein, carbs, etc."] },
    { "id": "2", "columns": ["Snack 1", "11:00", "Snack details"] },
    { "id": "3", "columns": ["Lunch", "13:30", "Lunch details"] },
    { "id": "4", "columns": ["Snack 2", "16:30", "Snack details"] },
    { "id": "5", "columns": ["Dinner", "19:30", "Dinner details"] },
    { "id": "6", "columns": ["Total", "-", "Daily Total summary"] }
  ],
  "cardio": [
    { "id": "1", "columns": ["Monday", "Easy Run", "5 km", "30 min"] },
    { "id": "2", "columns": ["Tuesday", "Rest or Light Walk", "-", "-"] },
    { "id": "3", "columns": ["Wednesday", "Interval Training", "6 km", "35 min"] },
    { "id": "4", "columns": ["Thursday", "Easy Run", "5 km", "32 min"] },
    { "id": "5", "columns": ["Friday", "Rest", "-", "-"] },
    { "id": "6", "columns": ["Saturday", "Long Run", "8-10 km", "55-65 min"] },
    { "id": "7", "columns": ["Sunday", "Rest or Yoga", "-", "-"] }
  ],
  "nutrients": [
    { "id": "0", "columns": ["", "Calories", "Protein", "Carbs", "Fats"] },
    { "id": "1", "columns": ["Breakfast", "480", "35g", "55g", "15g"] },
    { "id": "2", "columns": ["Snack 1", "220", "20g", "18g", "8g"] },
    { "id": "3", "columns": ["Lunch", "520", "45g", "45g", "18g"] },
    { "id": "4", "columns": ["Snack 2", "250", "6g", "25g", "15g"] },
    { "id": "5", "columns": ["Dinner", "380", "35g", "40g", "12g"] },
    { "id": "6", "columns": ["Total", "1,850", "141g", "183g", "68g"] }
  ],
  "recommended": [
    { "id": "1", "columns": ["Sleep Goal", "7.5 - 8.5 hours per night"] },
    { "id": "2", "columns": ["Step Target", "10,000 - 12,000 steps daily"] },
    { "id": "3", "columns": ["Strength Training", "3-4 sessions/week (Full body + Core focus)"] },
    { "id": "4", "columns": ["Habit Checklist", "• Drink 3.5L water\n• No added sugar\n• 10k steps\n• Sleep before 11 PM"] },
    { "id": "5", "columns": ["Motivation / Mindset", "Daily positive affirmation or quote"] }
  ],
  "challenges": [
    { "id": "1", "columns": ["Daily", "Push-up Challenge", "Week 1: 50/day", "Week 4: 150/day"] },
    { "id": "2", "columns": ["Daily", "No Sugar Challenge", "7-day streak = new badge", "", ""], "columnWidths": ["120px", "180px", "160px", "160px", "160px"] },
    { "id": "3", "columns": ["Daily", "Phone / Watch Steps", "Hit 25 days = Bonus points", "", ""], "columnWidths": ["120px", "180px", "160px", "160px", "160px"] },
    { "id": "4", "columns": ["Daily", "Log 3.5L water", "Full month = Water trophy", "", ""], "columnWidths": ["120px", "180px", "160px", "160px", "160px"] },
    { "id": "5", "columns": ["5 min / day", "Meditation or breathing", "Complete 20 days", "", ""], "columnWidths": ["120px", "180px", "160px", "160px", "160px"] }
  ],
  "supplements": [
    { "id": "1", "columns": ["Whey Protein", "Muscle recovery & growth", "25g", "Post-workout", ""], "columnWidths": ["120px", "180px", "160px", "160px", "160px"] },
    { "id": "2", "columns": ["Creatine Monohydrate", "Strength & performance", "5g", "Any time of day", ""], "columnWidths": ["120px", "180px", "160px", "160px", "160px"] },
    { "id": "3", "columns": ["Omega-3 Fish Oil", "Joint & heart health", "1-2g", "With meals", ""], "columnWidths": ["120px", "180px", "160px", "160px", "160px"] },
    { "id": "4", "columns": ["Vitamin D3", "Bone health & immunity", "1000-2000 IU", "With food", ""], "columnWidths": ["120px", "180px", "160px", "160px", "160px"] },
    { "id": "5", "columns": ["Multivitamin", "Overall health", "1 tablet", "With breakfast", ""], "columnWidths": ["120px", "180px", "160px", "160px", "160px"] }
  ]
}
---And only return this JSON response with no extra characters or text.`;

    await askAI(prompt);
  };

  const resetPlan = () => {
    setResetState(true);
  };

  useEffect(() => {
    if (resetState) {
      setResetState(false);
    }
  }, [resetState]);

  useEffect(() => {
    if (autoRun && userPrompt.trim()) {
      generatePlan();
    }
  }, [autoRun, userPrompt]);

  return { generatePlan, resetPlan };
};

export default useMakePlan;
