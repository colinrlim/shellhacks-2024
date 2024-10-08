// store/index.ts

import { configureStore } from "@reduxjs/toolkit";
import { useDispatch } from "react-redux";
import {
  knowledgeSlice,
  questionsSlice,
  userSlice,
  uiSlice,
  settingsSlice,
} from "./slices";

export const store = configureStore({
  reducer: {
    user: userSlice,
    knowledge: knowledgeSlice,
    questions: questionsSlice,
    ui: uiSlice,
    settings: settingsSlice,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
