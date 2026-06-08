'use client';

import { useState, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '@/lib/redux/hooks';
import { 
  setGeneratedPlan, 
  setIsGenerating, 
  setGenerationError 
} from '@/lib/redux/slices/planSlice';
import type { GeneratedPlan } from '@/lib/types/plan';

const isProduction = process.env.NODE_ENV === 'production';
const CORS_PROXY = isProduction ? '' : (process.env.NEXT_PUBLIC_CORS_PROXY || '');
const API_URL = `${CORS_PROXY}${process.env.NEXT_PUBLIC_PLAN_API || ''}`;

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

  const askAI = async (prompt: string): Promise<{ answer: string | null; error: string | null }> => {
    try {
      dispatch(setIsGenerating(true));
      dispatch(setGenerationError(null));

      const res = await fetch(API_URL || '/api/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      if (!res.ok) throw new Error('Failed to get plan from AI');

      const data = await res.json();
      dispatch(setIsGenerating(false));
      return { answer: data.answer || data.plan || null, error: null };
    } catch (err: unknown) {
      dispatch(setIsGenerating(false));
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      dispatch(setGenerationError(errorMessage));
      return { answer: null, error: errorMessage };
    }
  };

  const generatePlan = async () => {
    if (!userPrompt.trim()) {
      dispatch(setGenerationError('Please enter a prompt to generate a plan'));
      return;
    }

    const prompt = `Generate a comprehensive fitness and nutrition plan based on this user request: ${userPrompt}

Return ONLY a JSON object in the following exact format, no extra text:
{
  "meals": [
    { "id": "1", "columns": ["Meal Name", "Time", "Details"] },
    { "id": "2", "columns": ["Snack 1", "Time", "Details"] },
    ...
  ],
  "cardio": [
    { "id": "1", "columns": ["Day", "Activity", "Distance", "Duration"] },
    ...
  ],
  "nutrients": [
    { "id": "0", "columns": ["", "Calories", "Protein", "Carbs", "Fats"] },
    { "id": "1", "columns": ["Breakfast", "Value", "Value", "Value", "Value"] },
    ...
  ],
  "recommended": [
    { "id": "1", "columns": ["Sleep Goal", "Hours per night"] },
    ...
  ],
  "challenges": [
    { "id": "1", "columns": ["Frequency", "Challenge", "Goal"] },
    ...
  ],
  "supplements": [
    { "id": "1", "columns": ["Name", "Purpose", "Dosage", "Timing"] },
    ...
  ]
}`;

    const { answer, error } = await askAI(prompt);
    if (error) return;

    if (answer) {
      const filtered = filterResponse(answer);
      const parsedPlan: GeneratedPlan | null = safelyParseJSON(filtered);

      if (parsedPlan) {
        dispatch(setGeneratedPlan(parsedPlan));
      } else {
        dispatch(setGenerationError('Failed to parse plan from AI'));
      }
    }
  };

  const resetPlan = () => {
    setResetState(true);
    dispatch(setGeneratedPlan(null));
    dispatch(setGenerationError(null));
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
