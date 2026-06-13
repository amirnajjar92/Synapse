'use client';

import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { GeneratedPlan } from '@/lib/types/plan';
import mockPlan from '@/lib/mock-data/mock-plan.json';

// Interface for a single plan type (matches what's in mock-plan.json)
export interface PlanType {
  title: string;
  icon: string;
  tableData: { id: string | number; columns: string[] }[];
  columnWidths?: string[];
  horizontalScroll: boolean;
}

interface PlanState {
  promptText: string;
  enhancedPromptText: string;
  promptHistory: string[];
  currentTableIndex: number;
  planGenerated: boolean;
  generatedPlan: GeneratedPlan | null;
  planTypes: PlanType[]; // Mock data or generated plan converted
  isGenerating: boolean;
  generationError: string | null;
  planItemLoadingStates: boolean[]; // For GoalsSection ticks loading
}

const initialState: PlanState = {
  promptText: '',
  enhancedPromptText: '',
  promptHistory: [],
  currentTableIndex: 0,
  planGenerated: false,
  generatedPlan: null,
  planTypes: mockPlan.planTypes, // Start with mock data!
  isGenerating: false,
  generationError: null,
  planItemLoadingStates: [false, false, false, false, false, false], // 6 items
};

// Convert GeneratedPlan (from OpenAI) to PlanType[] (for plan-detail)
const convertGeneratedPlanToPlanTypes = (generatedPlan: GeneratedPlan): PlanType[] => {
  return [
    {
      title: 'MEALS',
      icon: '/vectors/meals-icon.svg',
      tableData: generatedPlan.meals,
      columnWidths: ['w-1/3', 'w-1/5'],
      horizontalScroll: false,
    },
    {
      title: 'CARDIO',
      icon: '/vectors/cardio-icon.svg',
      tableData: generatedPlan.cardio,
      columnWidths: ['w-1/4', 'w-1/3', 'w-1/5'],
      horizontalScroll: false,
    },
    {
      title: 'NUTRIENTS',
      icon: '/vectors/nutrients-icon.svg',
      tableData: generatedPlan.nutrients,
      columnWidths: ['w-1/4', 'w-1/6', 'w-1/6', 'w-1/6'],
      horizontalScroll: false,
    },
    {
      title: 'RECOMMENDED',
      icon: '/vectors/recomended-icon.svg',
      tableData: generatedPlan.recommended,
      columnWidths: ['w-2/5'],
      horizontalScroll: false,
    },
    {
      title: 'CHALLENGES',
      icon: '/vectors/challenges-icon.svg',
      tableData: generatedPlan.challenges,
      columnWidths: ['120px', '180px', '160px', '160px', '160px'],
      horizontalScroll: true,
    },
    {
      title: 'SUPPLEMENTS',
      icon: '/vectors/suppliments-icon.svg',
      tableData: generatedPlan.supplements,
      columnWidths: ['120px', '180px', '160px', '160px', '160px'],
      horizontalScroll: true,
    },
  ];
};

const planSlice = createSlice({
  name: 'plan',
  initialState,
  reducers: {
    setPromptText: (state, action: PayloadAction<string>) => {
      state.promptText = action.payload;
    },
    addPromptToHistory: (state, action: PayloadAction<string>) => {
      // Add only if not already in history
      if (!state.promptHistory.includes(action.payload)) {
        state.promptHistory.unshift(action.payload);
        // Keep only last 20 prompts
        if (state.promptHistory.length > 20) {
          state.promptHistory.pop();
        }
      }
    },
    setEnhancedPromptText: (state, action: PayloadAction<string>) => {
      state.enhancedPromptText = action.payload;
    },
    setCurrentTableIndex: (state, action: PayloadAction<number>) => {
      state.currentTableIndex = action.payload;
    },
    setPlanTypes: (state, action: PayloadAction<PlanType[]>) => {
      state.planTypes = action.payload;
    },
    setPlanGenerated: (state, action: PayloadAction<boolean>) => {
      state.planGenerated = action.payload;
    },
    setGeneratedPlan: (state, action: PayloadAction<GeneratedPlan | null>) => {
      state.generatedPlan = action.payload;
      if (action.payload) {
        state.planTypes = convertGeneratedPlanToPlanTypes(action.payload);
      } else {
        state.planTypes = mockPlan.planTypes; // Fallback to mock
      }
    },
    setIsGenerating: (state, action: PayloadAction<boolean>) => {
      state.isGenerating = action.payload;
      // When starting generation, set all plan items to loading
      if (action.payload) {
        state.planItemLoadingStates = [true, true, true, true, true, true];
        state.planGenerated = false;
      }
    },
    setGenerationError: (state, action: PayloadAction<string | null>) => {
      state.generationError = action.payload;
    },
    setPlanItemLoadingState: (
      state,
      action: PayloadAction<{ index: number; isLoading: boolean }>
    ) => {
      state.planItemLoadingStates[action.payload.index] = action.payload.isLoading;
      // If all are false, mark as generated!
      if (state.planItemLoadingStates.every((loading) => !loading)) {
        state.planGenerated = true;
      }
    },
    setTableData: (
      state,
      action: PayloadAction<{ index: number; tableData: { id: string | number; columns: string[] }[] }>
    ) => {
      state.planTypes[action.payload.index].tableData = action.payload.tableData;
    },
    resetPlan: (state) => {
      state.promptText = '';
      state.enhancedPromptText = '';
      state.promptHistory = [];
      state.currentTableIndex = 0;
      state.planGenerated = false;
      state.generatedPlan = null;
      state.planTypes = mockPlan.planTypes;
      state.isGenerating = false;
      state.generationError = null;
      state.planItemLoadingStates = [false, false, false, false, false, false];
    },
  },
});

export const {
  setPromptText,
  addPromptToHistory,
  setEnhancedPromptText,
  setCurrentTableIndex,
  setPlanTypes,
  setPlanGenerated,
  setGeneratedPlan,
  setIsGenerating,
  setGenerationError,
  setPlanItemLoadingState,
  setTableData,
  resetPlan,
} = planSlice.actions;
export default planSlice.reducer;