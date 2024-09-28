// questionsSlice.ts

import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Question, HistoricalQuestion } from "@/types";

interface QuestionsState {
  questions: Question[];
  favoritedQuestions: Question[];
  historicalQuestions: HistoricalQuestion[];
}

const initialState: QuestionsState = {
  questions: [],
  favoritedQuestions: [],
  historicalQuestions: [],
};

const questionsSlice = createSlice({
  name: "questions",
  initialState,
  reducers: {
    setQuestions(state, action: PayloadAction<Question[]>) {
      state.questions = action.payload;
    },
    setFavoritedQuestions(state, action: PayloadAction<Question[]>) {
      state.favoritedQuestions = action.payload;
    },
    addHistoricalQuestion(state, action: PayloadAction<HistoricalQuestion>) {
      state.historicalQuestions.push(action.payload);
    },
  },
});

export const { setQuestions, setFavoritedQuestions, addHistoricalQuestion } =
  questionsSlice.actions;

export default questionsSlice.reducer;

/**
 * questions: {
    questions: [
      {
        id: number,
        question: string,
        choices: {
          1: string,
          2: string,
          3: string,
          4: string,
        },
        correctChoice: number,
      },
      // More questions
    ],
    favoritedQuestions: [
      // Array of question objects
    ],
    historicalQuestions: [
      {
        question: questionObject,
        selectedChoice: number,
        isCorrect: boolean,
      },
      // More historical data
    ],
  },
 */
