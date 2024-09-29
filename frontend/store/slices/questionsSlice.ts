// questionsSlice.ts

import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import { Question, HistoricalQuestion } from "@/types";
import axios from "axios";
import { setTopics } from "./knowledgeSlice";

interface AnswerQuestionPayloadProps {
  questionId: number;
  selectedChoice: number;
  currentTopic: string;
}

export const answerQuestion = createAsyncThunk(
  "questions/answerQuestion",
  async (
    { questionId, selectedChoice, currentTopic }: AnswerQuestionPayloadProps,
    thunkAPI
  ) => {
    try {
      const response = await axios.post("/api/questions/answer", {
        questionId,
        selectedChoice,
        currentTopic,
      });

      const { data } = response;

      if (data.updateFlags.topics) {
        thunkAPI.dispatch(setTopics(data.payload.topics));
      }

      return data;
    } catch (error: any) {
      return error.response?.data?.message || error.message;
    }
  }
);

interface LoadingState {
  [key: string]: boolean;
}
interface QuestionsState {
  questions: Question[];
  favoritedQuestions: Question[];
  historicalQuestions: HistoricalQuestion[];
  loading: LoadingState;
  error: string | null;
}

const initialState: QuestionsState = {
  questions: [],
  favoritedQuestions: [],
  historicalQuestions: [],
  loading: {},
  error: null,
};

const questionsSlice = createSlice({
  name: "questions",
  initialState,
  reducers: {
    setQuestions(state, action: PayloadAction<Question[]>) {
      state.questions = action.payload;
    },
    addQuestion(state, action: PayloadAction<Question>) {
      state.questions.unshift(action.payload);
    },
    setFavoritedQuestions(state, action: PayloadAction<Question[]>) {
      state.favoritedQuestions = action.payload;
    },
    addHistoricalQuestion(state, action: PayloadAction<HistoricalQuestion>) {
      state.historicalQuestions.push(action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(answerQuestion.pending, (state, action) => {
        const { questionId } = action.meta.arg;
        state.loading[questionId] = true;
        state.error = null;
      })
      .addCase(answerQuestion.fulfilled, (state, action) => {
        // We need to review which data changed
        const thunkPayload = action.payload;
        const { payload, updateFlags } = thunkPayload;

        // If questions were updated, dispatch setQuestions
        if (updateFlags && updateFlags.questions) {
          state.questions = payload.questions;
        }

        const { questionId } = action.meta.arg;
        state.loading[questionId] = false;
        state.error = null;
      })
      .addCase(answerQuestion.rejected, (state, action) => {
        const { questionId } = action.meta.arg;
        state.loading[questionId] = false;
        state.error = action.payload as string;
      });
  },
});

export const { setQuestions, setFavoritedQuestions, addHistoricalQuestion } =
  questionsSlice.actions;

export default questionsSlice.reducer;
