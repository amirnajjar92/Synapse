'use client';

import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { GeneratedPlan } from '@/lib/types/plan';

interface PlanState {
  promptText: string;
  currentTableIndex: number;
  planGenerated: boolean;
  generatedPlan: GeneratedPlan | null;
  isGenerating: boolean;
  generationError: string | null;
}

const initialState: PlanState = {
  promptText: '',
  currentTableIndex: 0,
  planGenerated: false,
  generatedPlan: null,
  isGenerating: false,
  generationError: null,
};

const planSlice = createSlice({
  name: 'plan',
  initialState,
  reducers: {
    setPromptText: (state, action: PayloadAction<string>) => {
      state.promptText = action.payload;
    },
    setCurrentTableIndex: (state, action: PayloadAction<number>) => {
      state.currentTableIndex = action.payload;
    },
    setPlanGenerated: (state, action: PayloadAction<boolean>) => {
      state.planGenerated = action.payload;
    },
    setGeneratedPlan: (state, action: PayloadAction<GeneratedPlan | null>) => {
      state.generatedPlan = action.payload;
    },
    setIsGenerating: (state, action: PayloadAction<boolean>) => {
      state.isGenerating = action.payload;
    },
    setGenerationError: (state, action: PayloadAction<string | null>) => {
      state.generationError = action.payload;
    },
  },
});

export const { 
  setPromptText, 
  setCurrentTableIndex, 
  setPlanGenerated, 
  setGeneratedPlan, 
  setIsGenerating, 
  setGenerationError 
} = planSlice.actions;
export default planSlice.reducer;