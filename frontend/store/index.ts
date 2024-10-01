// store/index.ts

// Imports
import { configureStore } from "@reduxjs/toolkit";
import { useDispatch } from "react-redux";
import { knowledgeSlice, questionsSlice, userSlice, uiSlice } from "./slices";

// * Store Configuration
export const store = configureStore({
  reducer: {
    user: userSlice,
    knowledge: knowledgeSlice,
    questions: questionsSlice,
    ui: uiSlice,
  },
  // Redux Toolkit includes thunk middleware by default
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Custom hook to use dispatch with TypeScript
export const useAppDispatch = () => useDispatch<AppDispatch>();
