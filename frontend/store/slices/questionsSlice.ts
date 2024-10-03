// @/store/slices/questionsSlice

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

      if (data.updateFlags.questions) {
        thunkAPI.dispatch(setQuestions(data.payload.questions));
      }
      if (data.updateFlags.topics) {
        thunkAPI.dispatch(setTopics(data.payload.topics));
      }

      return data.payload;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        return thunkAPI.rejectWithValue(
          error.response?.data?.message || error.message
        );
      }
    }
  }
);

export const fetchExplanation = createAsyncThunk(
  "questions/fetchExplanation",
  async (questionId: number, thunkAPI) => {
    try {
      const response = await axios.get(
        `/api/questions/${questionId}/explanation`
      );
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        return thunkAPI.rejectWithValue(
          error.response?.data?.message || error.message
        );
      }
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
    answerClientSideQuestion(
      state,
      action: PayloadAction<AnswerQuestionPayloadProps>
    ) {
      const { questionId, selectedChoice } = action.payload;
      const question = state.questions.find((q) => q._id === questionId);

      if (!question) return;

      question.selectedChoice = selectedChoice;
      question.isCorrect = selectedChoice === question.correctChoice;
    },
    setExplanation(
      state,
      action: PayloadAction<{ questionId: number; explanation: string }>
    ) {
      const { questionId, explanation } = action.payload;
      const question = state.questions.find((q) => q._id === questionId);
      if (question) {
        question.explanation = explanation;
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
        const { questionId } = action.meta.arg;
        state.loading[questionId] = false;
        state.error = null;

        if (action.payload && action.payload.questions) {
          const updatedQuestion = action.payload.questions.find(
            (q: Question) => q._id === questionId
          );
          if (updatedQuestion) {
            const index = state.questions.findIndex(
              (q) => q._id === questionId
            );
            if (index !== -1) {
              state.questions[index] = updatedQuestion;
            }
          }
        }
      })
      .addCase(answerQuestion.rejected, (state, action) => {
        const { questionId } = action.meta.arg;
        state.loading[questionId] = false;
        state.error = action.payload as string;
      })
      .addCase(fetchExplanation.fulfilled, (state, action) => {
        const { questionId, explanation } = action.payload;
        const question = state.questions.find((q) => q._id === questionId);
        if (question) {
          question.explanation = explanation;
        }
      });
  },
});

export const {
  setQuestions,
  setFavoritedQuestions,
  addHistoricalQuestion,
  answerClientSideQuestion,
  setExplanation,
} = questionsSlice.actions;

export default questionsSlice.reducer;
