'use client';

import { useState, useCallback } from 'react';

// Interface for table row
interface PlanTableData {
  id: string | number;
  columns: string[];
}

// Hook interface
interface UseWorkoutPlannerReturn {
  isGenerating: boolean;
  planGenerated: boolean;
  planData: PlanTableData[];
  error: string | null;
  generateWorkoutPlan: (prompt: string, selectedMuscles: string[]) => Promise<void>;
  saveWorkoutPlan: (prompt: string) => Promise<any>;
  resetPlan: () => void;
}

// Clean up AI response
const filterResponse = (response: string): string => {
  let filtered = response.trim();
  
  if (filtered.startsWith('```json')) {
    filtered = filtered.slice(7);
  }
  if (filtered.startsWith('```')) {
    filtered = filtered.slice(3);
  }
  if (filtered.endsWith('```')) {
    filtered = filtered.slice(0, -3);
  }
  
  filtered = filtered.trim();
  
  if (!filtered.startsWith('[')) {
    filtered = `[${filtered}]`;
  }
  
  return filtered;
};

// Repair JSON with literal newlines inside string values (common AI output issue)
// Tracks whether we're inside a JSON string and only replaces newlines that appear within strings
const repairJson = (str: string): string => {
  let result = '';
  let inString = false;

  for (let i = 0; i < str.length; i++) {
    const ch = str[i];

    if (ch === '"') {
      // Count preceding backslashes to check if this quote is escaped
      let backslashCount = 0;
      for (let j = i - 1; j >= 0 && str[j] === '\\'; j--) {
        backslashCount++;
      }
      // Even number of backslashes means this quote is NOT escaped
      if (backslashCount % 2 === 0) {
        inString = !inString;
      }
      result += ch;
    } else if (ch === '\n') {
      if (inString) {
        // Inside a JSON string — replace literal newline with escaped sequence
        result += '\\n';
      } else {
        // Structural whitespace — keep as-is
        result += ch;
      }
    } else if (ch === '\t' || ch === '\r') {
      if (inString) {
        result += ch === '\t' ? '\\t' : '';
      }
      // Outside strings, just skip tabs/carriage returns
    } else {
      result += ch;
    }
  }

  return result;
};

const safelyParseJSON = (jsonString: string) => {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    try {
      const repaired = repairJson(jsonString);
      return JSON.parse(repaired);
    } catch (retryError) {
      console.error('Failed to parse JSON workout response:', retryError, 'Raw string:', jsonString);
      return null;
    }
  }
};

// Default workout plan as fallback
const DEFAULT_WORKOUT_PLAN: PlanTableData[] = [
  { id: 1, columns: ["Monday", "Chest & Triceps", "Bench Press: 4x8-10\nIncline DB Press: 3x12\nTricep Pushdown: 3x12", "45 min"] },
  { id: 2, columns: ["Tuesday", "Back & Biceps", "Pull-ups: 3x8\nBarbell Rows: 4x10\nBicep Curls: 3x12", "45 min"] },
  { id: 3, columns: ["Wednesday", "Legs", "Squats: 4x10\nLeg Press: 3x12\nLeg Curls: 3x12", "50 min"] },
  { id: 4, columns: ["Thursday", "Shoulders & Abs", "O Lateral Raises: 3x12\nFace Pulls: 3x15\nPlank: 3x45s", "40 min"] },
  { id: 5, columns: ["Friday", "Full Body HIIT", "Circuit Training\n30s work/15s rest\n10 exercises", "30 min"] },
  { id: 6, columns: ["Saturday", "Cardio", "Steady State Running\n30-45 minutes\nModerate pace", "45 min"] },
  { id: 7, columns: ["Sunday", "Rest", "Active Recovery\nLight stretching or yoga", "0 min"] },
];

const useWorkoutPlanner = (): UseWorkoutPlannerReturn => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [planGenerated, setPlanGenerated] = useState(false);
  const [planData, setPlanData] = useState<PlanTableData[]>([]);
  const [error, setError] = useState<string | null>(null);

  const generateWorkoutPlan = useCallback(async (prompt: string, selectedMuscles: string[]) => {
    if (!prompt.trim()) {
      setError('Please enter a workout goal');
      return;
    }
    
    setIsGenerating(true);
    setPlanGenerated(false);
    setError(null);

    try {
      const apiUrl = 'https://moole-back.vercel.app/ask-moole';
      
      const muscleContext = selectedMuscles.length > 0 
        ? `\nTarget Muscles: ${selectedMuscles.join(', ')}` 
        : '';

      const systemPrompt = `SYSTEM: You are an elite fitness coach specializing in creating highly personalized workout plans. You are creative, practical, and always keep the structure consistent.

USER'S EXACT REQUEST: ${prompt}${muscleContext}

TASK: Generate a detailed weekly workout plan.

TABLE STRUCTURE REQUIREMENTS:
- Column 1: Day of the week (Monday, Tuesday, etc.)
- Column 2: Muscle group or workout type
- Column 3: Detailed exercises with sets/reps
- Column 4: Estimated duration

USE THIS JSON FORMAT (EXACT SAME STRUCTURE, DIFFERENT CONTENT):
[
  {"id":1,"columns":["Monday","Chest & Triceps","Bench Press: 4x8-10\nIncline DB Press: 3x12\nTricep Pushdown: 3x12","45 min"]},
  {"id":2,"columns":["Tuesday","Back & Biceps","Pull-ups: 3x8\nBarbell Rows: 4x10\nBicep Curls: 3x12","45 min"]},
  {"id":3,"columns":["Wednesday","Legs","Squats: 4x10\nLeg Press: 3x12\nLeg Curls: 3x12","50 min"]},
  {"id":4,"columns":["Thursday","Shoulders & Abs","O Lateral Raises: 3x12\nFace Pulls: 3x15\nPlank: 3x45s","40 min"]},
  {"id":5,"columns":["Friday","Full Body HIIT","Circuit Training\n30s work/15s rest\n10 exercises","30 min"]},
  {"id":6,"columns":["Saturday","Cardio","Steady State Running\n30-45 minutes\nModerate pace","45 min"]},
  {"id":7,"columns":["Sunday","Rest","Active Recovery\nLight stretching or yoga","0 min"]}
]

RULES:
1. Return ONLY the JSON array, nothing else
2. NO explanations, NO extra text
3. Personalize EVERY value based on the user's request
4. If target muscles are specified, focus workouts on those areas
5. Match the fitness level mentioned by user (beginner/intermediate/advanced)
6. Be creative but realistic
7. Include rest day on Sunday or as appropriate

CRITICAL: And only return this JSON response with no extra characters, no text, no symbols, no markdown code blocks, no explanations before or after. The response must start with [ and end with ]. Any extra characters will cause a parsing error.`;

      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: systemPrompt }),
      });

      if (!res.ok) {
        throw new Error(`API error: ${res.status}`);
      }

      const data = await res.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      // Clean and parse the response
      const filtered = filterResponse(data.answer);
      const parsedData = safelyParseJSON(filtered);

      let finalPlanData = DEFAULT_WORKOUT_PLAN;
      
      if (parsedData && Array.isArray(parsedData.tableData)) {
        finalPlanData = parsedData.tableData;
      } else if (parsedData && Array.isArray(parsedData)) {
        finalPlanData = parsedData;
      } else {
        console.warn('Using default workout plan as fallback');
      }
      
      setPlanData(finalPlanData);
      setPlanGenerated(true);
    } catch (err) {
      console.error('Error generating workout plan:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate workout plan');
      // Use default plan on error
      setPlanData(DEFAULT_WORKOUT_PLAN);
      setPlanGenerated(true);
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const resetPlan = useCallback(() => {
    setPlanGenerated(false);
    setPlanData([]);
    setError(null);
  }, []);

  const saveWorkoutPlan = useCallback(async (prompt: string) => {
    if (!planData.length) {
      console.error('No plan data to save');
      return null;
    }

    // Get user email from localStorage
    const userStr = localStorage.getItem('synapse_user');
    const user = userStr ? JSON.parse(userStr) : null;
    if (!user?.email) {
      console.error('No user email found');
      return null;
    }

    // Generate a short title using AI
    let shortTitle = 'Workout Plan';
    try {
      const titleResponse = await fetch('/api/ai/analyse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: `Generate a short, catchy title (maximum 5 words) for this workout plan: "${prompt}". Only return the title, nothing else. No quotes.`
        }),
      });

      if (titleResponse.ok) {
        const titleData = await titleResponse.json();
        const generatedTitle = titleData.answer?.trim();
        if (generatedTitle) {
          shortTitle = generatedTitle.replace(/^["']|["']$/g, '');
        }
      }
    } catch (error) {
      console.error('Error generating title:', error);
      shortTitle = prompt.length > 50 ? prompt.substring(0, 50) + '...' : prompt;
    }

    const planDataPayload = {
      title: shortTitle,
      prompt: prompt,
      icon: '/vectors/plan-icon.svg',
      tables: [{
        title: 'WORKOUT PLAN',
        rows: planData,
      }],
      userEmail: user.email,
    };

    try {
      const response = await fetch('/api/plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(planDataPayload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Save plan failed:', response.status, errorText);
        throw new Error(`Failed to save plan: ${response.status}`);
      }

      const data = await response.json();
      console.log('Workout plan saved:', data.plan);
      localStorage.setItem('current_plan_id', data.plan.id);
      return data.plan;
    } catch (error) {
      console.error('Error saving workout plan:', error);
      return null;
    }
  }, [planData]);

  return { 
    isGenerating, 
    planGenerated, 
    planData, 
    error, 
    generateWorkoutPlan, 
    saveWorkoutPlan,
    resetPlan 
  };
};

export default useWorkoutPlanner;