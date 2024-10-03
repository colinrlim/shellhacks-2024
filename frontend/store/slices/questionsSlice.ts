// @/store/slices/questionsSlice
/**
 * This is the questions slice of the Redux store.
 * It contains the questions state and reducers for setting questions, favorited questions, and historical questions.
 */

// Imports
import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import { Question, HistoricalQuestion } from "@/types";
import axios from "axios";
import { setTopics } from "./knowledgeSlice";

// Interface for the payload of the answerQuestion async thunk
interface AnswerQuestionPayloadProps {
  questionId: number;
  selectedChoice: number;
  currentTopic: string;
}

// Async thunk to answer a question
export const answerQuestion = createAsyncThunk(
  "questions/answerQuestion",
  async (
    { questionId, selectedChoice, currentTopic }: AnswerQuestionPayloadProps,
    thunkAPI
  ) => {
    try {
      // Send POST request to answer the question
      const response = await axios.post("/api/questions/answer", {
        questionId,
        selectedChoice,
        currentTopic,
      });
      const { data } = response;

      // Check if questions or topics were updated, and dispatch the appropriate actions
      if (data.updateFlags.questions) {
        thunkAPI.dispatch(setQuestions(data.payload.questions));
      }
      if (data.updateFlags.topics) {
        thunkAPI.dispatch(setTopics(data.payload.topics));
      }

      return data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        return thunkAPI.rejectWithValue(
          error.response?.data?.message || error.message
        );
      }
    }
  }
);
// Interface for the loading states
interface LoadingState {
  [key: string]: boolean;
}

// Interface for the questions state
interface QuestionsState {
  questions: Question[];
  favoritedQuestions: Question[];
  historicalQuestions: HistoricalQuestion[];
  loading: LoadingState;
  error: string | null;
}

// Initial state for the questions slice
const initialState: QuestionsState = {
  questions: [],
  favoritedQuestions: [],
  historicalQuestions: [],
  loading: {},
  error: null,
};

// Questions slice
const questionsSlice = createSlice({
  name: "questions",
  initialState,
  reducers: {
    setQuestions(state, action: PayloadAction<Question[]>) {
      if (state.questions.length === 0) {
        state.questions = action.payload;
      } else if (
        state.questions.length < action.payload.length &&
        action.payload.length > 0
      ) {
        for (
          let i = state.questions.length + 1;
          i < action.payload.length;
          i++
        ) {
          state.questions.push(action.payload[i]);
        }
      } else {
        state.questions = action.payload;
      }
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
    answerClientSideQuestion(
      state,
      action: PayloadAction<AnswerQuestionPayloadProps>
    ) {
      const { questionId, selectedChoice } = action.payload;
      const question = state.questions.find((q) => q._id === questionId);

      if (!question) return;

      question.selectedChoice = selectedChoice;

      if (question.selectedChoice === question.correctChoice) {
        question.isCorrect = true;
      } else {
        question.isCorrect = false;
      }
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

export const {
  setQuestions,
  setFavoritedQuestions,
  addHistoricalQuestion,
  answerClientSideQuestion,
} = questionsSlice.actions;

export default questionsSlice.reducer;
