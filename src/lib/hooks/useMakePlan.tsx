'use client';

import { useState, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '@/lib/redux/hooks';
import { store } from '@/lib/redux/store';
import {
  setIsGenerating,
  setGenerationError,
  setPlanItemLoadingState,
  setTableData,
} from '@/lib/redux/slices/planSlice';
import mockPlan from '@/lib/mock-data/mock-plan.json';

const filterResponse = (response: string): string => {
  // Remove any markdown code blocks and extra whitespace
  let filtered = response.trim();
  
  // Remove ```json at start
  if (filtered.startsWith('```json')) {
    filtered = filtered.slice(7);
  }
  
  // Remove ``` at end
  if (filtered.endsWith('```')) {
    filtered = filtered.slice(0, -3);
  }
  
  // Remove any leading/trailing whitespace again
  filtered = filtered.trim();
  
  // If it doesn't start with [, add it (and ] at end)
  if (!filtered.startsWith('[')) {
    // Check if it starts with { and has multiple objects
    filtered = `[${filtered}]`;
  }
  
  return filtered;
};

const safelyParseJSON = (jsonString: string) => {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('Failed to parse JSON plan response:', error, 'Raw string:', jsonString);
    return null;
  }
};

// Define table metadata for each plan type
const TABLE_METADATA = [
  {
    index: 0,
    title: 'MEALS',
    mockTableData: mockPlan.planTypes[0].tableData,
  },
  {
    index: 1,
    title: 'CARDIO',
    mockTableData: mockPlan.planTypes[1].tableData,
  },
  {
    index: 2,
    title: 'NUTRIENTS',
    mockTableData: mockPlan.planTypes[2].tableData,
  },
  {
    index: 3,
    title: 'RECOMMENDED',
    mockTableData: mockPlan.planTypes[3].tableData,
  },
  {
    index: 4,
    title: 'CHALLENGES',
    mockTableData: mockPlan.planTypes[4].tableData,
  },
  {
    index: 5,
    title: 'SUPPLEMENTS',
    mockTableData: mockPlan.planTypes[5].tableData,
  },
];

const useMakePlan = (userPrompt: string, autoRun = false) => {
  const dispatch = useAppDispatch();
  const { isGenerating } = useAppSelector((state) => state.plan);

  const [resetState, setResetState] = useState(false);

  const askAIForTable = async (
    tableIndex: number,
    tableTitle: string,
    tablePrompt: string
  ): Promise<void> => {
    try {
      const apiUrl = 'https://moole-back.vercel.app/ask-moole';
      const useMockData = false; // Set to true for testing without API

      if (useMockData) {
        console.log(`Using mock data for ${tableTitle}`);
        await new Promise((resolve) => setTimeout(resolve, 800 + Math.random() * 700));
        dispatch(
          setTableData({
            index: tableIndex,
            tableData: TABLE_METADATA[tableIndex].mockTableData,
          })
        );
        dispatch(setPlanItemLoadingState({ index: tableIndex, isLoading: false }));
        return;
      }

      console.log(`Calling API for ${tableTitle}`);
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: tablePrompt }),
      });

      if (!res.ok) {
        const errorData = await res.text();
        console.error(`API Error for ${tableTitle}:`, res.status, errorData);
        throw new Error(`Failed to generate ${tableTitle}`);
      }

      const data = await res.json();
      console.log(`API response for ${tableTitle}:`, data);
      
      if (data.error) {
        throw new Error(data.error);
      }

      const filtered = filterResponse(data.answer);
      console.log(`Filtered response for ${tableTitle}:`, filtered);
      
      const parsedTableData = safelyParseJSON(filtered);
      console.log(`Parsed table data for ${tableTitle}:`, parsedTableData);

      let finalTableData = TABLE_METADATA[tableIndex].mockTableData;
      
      if (parsedTableData && Array.isArray(parsedTableData.tableData)) {
        finalTableData = parsedTableData.tableData;
      } else if (parsedTableData && Array.isArray(parsedTableData)) {
        finalTableData = parsedTableData;
      } else {
        console.warn(`Using mock data as fallback for ${tableTitle}`);
      }
      
      dispatch(
        setTableData({
          index: tableIndex,
          tableData: finalTableData,
        })
      );
    } catch (err) {
      console.error(`Error generating ${tableTitle}:`, err);
      dispatch(setGenerationError(err instanceof Error ? err.message : 'Unknown error'));
      // Fallback to mock data on error
      dispatch(
        setTableData({
          index: tableIndex,
          tableData: TABLE_METADATA[tableIndex].mockTableData,
        })
      );
    } finally {
      dispatch(setPlanItemLoadingState({ index: tableIndex, isLoading: false }));
    }
  };

  const generatePlan = async () => {
    if (!userPrompt.trim()) {
      dispatch(setGenerationError('Please enter a prompt to generate a plan'));
      return;
    }

    dispatch(setIsGenerating(true));
    dispatch(setGenerationError(null));

    // Generate personalized prompts for each table
    const tablePrompts = TABLE_METADATA.map((metadata) => {
      const mockDataString = JSON.stringify(metadata.mockTableData, null, 2);
      
      let tableSpecificContext = '';
      let fewShotExample = '';

      switch (metadata.title) {
        case 'MEALS':
          tableSpecificContext = `
- Column 1: Meal name (Breakfast, Snack 1, Lunch, Snack 2, Dinner, Total)
- Column 2: Approximate time to eat
- Column 3: Specific, personalized meal based on user's goal
`;
          fewShotExample = `
Example for "gain 5kg muscle in 30 days":
[
  {"id":1,"columns":["Breakfast","07:30","4 Eggs + 100g Oats + 1 Banana + 20g Peanut Butter"]},
  {"id":2,"columns":["Snack 1","10:30","Greek Yogurt + 30g Protein + 50g Granola"]},
  {"id":3,"columns":["Lunch","13:00","150g Chicken + 150g Rice + 100g Broccoli"]},
  {"id":4,"columns":["Snack 2","16:30","Apple + 30g Almonds + Protein Shake"]},
  {"id":5,"columns":["Dinner","19:30","120g Salmon + 200g Sweet Potato + 100g Spinach"]},
  {"id":6,"columns":["Total","-","Daily Total"]}
]
`;
          break;
        case 'CARDIO':
          tableSpecificContext = `
- Column 1: Day of the week (Monday, Tuesday, etc.)
- Column 2: Type of cardio
- Column 3: Distance/Duration goal tailored to user's fitness level
- Column 4: Estimated time to complete
`;
          fewShotExample = `
Example for "improve endurance for marathon":
[
  {"id":1,"columns":["Monday","Easy Run","8 km","45 min"]},
  {"id":2,"columns":["Tuesday","Interval Training","5 km","30 min"]},
  {"id":3,"columns":["Wednesday","Long Slow Distance","12 km","70 min"]},
  {"id":4,"columns":["Thursday","Cross-Training (Cycling)","45 min","-"]},
  {"id":5,"columns":["Friday","Easy Run","6 km","35 min"]},
  {"id":6,"columns":["Saturday","Tempo Run","10 km","55 min"]},
  {"id":7,"columns":["Sunday","Rest or Yoga","-","-"]}
]
`;
          break;
        case 'NUTRIENTS':
          tableSpecificContext = `
- Column 1: Meal name
- Column 2: Calories (adjusted to user's goal: deficit for weight loss, surplus for gain)
- Column 3: Protein in grams
- Column 4: Carbs in grams
- Column 5: Fats in grams
- Include a Total row at the end
`;
          fewShotExample = `
Example for "lose 5kg in 30 days (deficit)":
[
  {"id":0,"columns":["","Calories","Protein","Carbs","Fats"]},
  {"id":1,"columns":["Breakfast","400","30g","45g","12g"]},
  {"id":2,"columns":["Snack 1","200","18g","15g","7g"]},
  {"id":3,"columns":["Lunch","450","40g","40g","15g"]},
  {"id":4,"columns":["Snack 2","220","5g","22g","13g"]},
  {"id":5,"columns":["Dinner","330","30g","35g","10g"]},
  {"id":6,"columns":["Total","1,600","123g","157g","57g"]}
]
`;
          break;
        case 'RECOMMENDED':
          tableSpecificContext = `
- Column 1: Category name
- Column 2: Personalized recommendation based on user's goal
`;
          fewShotExample = `
Example for "busy professional, lose 3kg":
[
  {"id":1,"columns":["Sleep Goal","7 - 8 hours / night, sleep before 11 PM"]},
  {"id":2,"columns":["Step Target","8,000 - 10,000 steps daily"]},
  {"id":3,"columns":["Strength Training","3 sessions/week (30 mins each, bodyweight)"]},
  {"id":4,"columns":["Habit Checklist","• 2.5L water daily\n• No sugary drinks\n• 8k steps\n• Meal prep on Sundays"]},
  {"id":5,"columns":["Motivation / Mindset","Focus on consistency, not perfection"]}
]
`;
          break;
        case 'CHALLENGES':
          tableSpecificContext = `
- Column 1: Challenge name
- Column 2: Brief description
- Column 3: Frequency (Daily, 3x/week, etc.)
- Column 4: How to track it
- Column 5: Progression or reward
`;
          fewShotExample = `
Example for "beginner fitness":
[
  {"id":1,"columns":["Bodyweight Squat Challenge","Build leg strength","Daily","Count reps","Week 1: 30/day → Week 4: 100/day"]},
  {"id":2,"columns":["Water Challenge","Stay hydrated","Daily","Log in app","21-day streak = New badge"]},
  {"id":3,"columns":["Morning Stretch Challenge","Improve flexibility","Daily","5 mins stretch","30 days = Flexibility milestone"]},
  {"id":4,"columns":["No Soda Challenge","Cut empty calories","Daily","Mark days","14 days = Healthier choices"]},
  {"id":5,"columns":["Gratitude Challenge","Improve mindset","Daily","Write 1 thing","30 days = Mental wellness"]}
]
`;
          break;
        case 'SUPPLEMENTS':
          tableSpecificContext = `
- Column 1: Supplement name
- Column 2: Purpose/benefit
- Column 3: Frequency
- Column 4: Dosage
- Column 5: Best time to take
`;
          fewShotExample = `
Example for "vegan diet, build muscle":
[
  {"id":1,"columns":["Plant-Based Protein","Muscle recovery","Daily","30g","Post-workout"]},
  {"id":2,"columns":["Creatine Monohydrate","Strength gain","Daily","5g","Any time"]},
  {"id":3,"columns":["B12","Energy & nervous system","Daily","1000 mcg","With breakfast"]},
  {"id":4,"columns":["Iron","Prevent deficiency","Daily","18 mg","With vitamin C"]},
  {"id":5,"columns":["Omega-3 (Algal)","Joint & heart health","Daily","1-2g","With meals"]}
]
`;
          break;
      }

      return `SYSTEM: You are an elite fitness and nutrition coach who creates highly personalized, detailed plans tailored EXACTLY to the user's specific goals, constraints, and lifestyle. You are creative, practical, and always keep the structure consistent.

USER'S EXACT GOAL/REQUEST: ${userPrompt}

TASK: Generate ONLY the ${metadata.title} table data tailored to the user's request.

TABLE STRUCTURE REQUIREMENTS:
${tableSpecificContext}

USE THIS JSON FORMAT (EXACT SAME STRUCTURE, DIFFERENT CONTENT):
${mockDataString}

FEW-SHOT EXAMPLE (for reference only, don't copy exactly):
${fewShotExample}

RULES:
1. Return ONLY the JSON array, nothing else
2. NO explanations, NO extra text
3. Personalize EVERY value based on the user's request
4. Keep the same number of rows as the example
5. Be creative but realistic
6. Match the column structure EXACTLY`;
    });

    // Start all table requests in parallel!
    const tablePromises = tablePrompts.map((prompt, index) =>
      askAIForTable(index, TABLE_METADATA[index].title, prompt)
    );

    // Wait for all tables to complete
    await Promise.all(tablePromises);

    // Mark overall generation as complete
    dispatch(setIsGenerating(false));
    
    // Auto-save the plan!
    const planState = store.getState().plan;
    savePlan({ planTypes: planState.planTypes, promptText: userPrompt });
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

  const savePlan = async ({ planTypes, promptText }: { planTypes: any[]; promptText: string }) => {
    if (!planTypes) return;

    // Get user email from localStorage
    const userStr = localStorage.getItem('synapse_user');
    const user = userStr ? JSON.parse(userStr) : null;
    if (!user?.email) {
      console.error('No user email found');
      return;
    }

    const planData = {
      title: promptText || 'Personalized Plan',
      prompt: promptText,
      icon: '/vectors/plan-icon.svg',
      tables: planTypes.map((pt) => ({
        title: pt.title,
        rows: pt.tableData,
      })),
      userEmail: user.email, // Add user email to plan data
    };

    try {
      console.log('Attempting to save plan with data:', planData);
      const response = await fetch('/api/plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(planData),
      });
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Save plan failed with status:', response.status, 'Error text:', errorText);
        throw new Error(`Failed to save plan: ${response.status} - ${errorText}`);
      }
      const data = await response.json();
      console.log('Plan saved successfully:', data.plan);
      return data.plan;
    } catch (error) {
      console.error('Error saving plan:', error);
    }
  };

  return { generatePlan, resetPlan, savePlan };
};

export default useMakePlan;
