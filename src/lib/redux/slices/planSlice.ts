'use client';

import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface PlanState {
  promptText: string;
  currentTableIndex: number;
  planGenerated: boolean;
}

const initialState: PlanState = {
  promptText: '',
  currentTableIndex: 0,
  planGenerated: false,
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
  },
});

export const { setPromptText, setCurrentTableIndex, setPlanGenerated } = planSlice.actions;
export default planSlice.reducer;