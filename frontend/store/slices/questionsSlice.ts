// @/store/slices/questionsSlice.ts

import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import { Question, HistoricalQuestion } from "@/types";
import axios from "axios";
import { setTopics } from "./knowledgeSlice";
import Logger from "@/utils/logger";

// Interface for the payload of the answerQuestion async thunk
interface AnswerQuestionPayloadProps {
  questionId: number;
  selectedChoice: number;
  currentTopic: string;
}

/**
 * Async thunk for answering a question
 * This makes an API call to submit the user's answer and update the question state
 */
export const answerQuestion = createAsyncThunk(
  "questions/answerQuestion",
  async (
    { questionId, selectedChoice, currentTopic }: AnswerQuestionPayloadProps,
    thunkAPI
  ) => {
    try {
      Logger.info(
        `Answering question ${questionId} with choice ${selectedChoice} for topic "${currentTopic}"`
      );

      const response = await axios.post("/learn/api/questions/answer", {
        questionId,
        selectedChoice,
        currentTopic,
      });
      const { data } = response;
      Logger.debug(`Answer response for question ${questionId}:`, data);

      if (data.updateFlags.questions) {
        Logger.info(
          `Updating questions based on server response for question ${questionId}`
        );
        thunkAPI.dispatch(setQuestions(data.payload.questions));
      }
      if (data.updateFlags.topics) {
        Logger.info(
          `Updating topics based on server response for question ${questionId}`
        );
        thunkAPI.dispatch(setTopics(data.payload.topics));
      }

      return data.payload;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        Logger.error(
          `Error answering question ${questionId}:`,
          error.response?.data?.message || error.message
        );
        return thunkAPI.rejectWithValue(
          error.response?.data?.message || error.message
        );
      }
      Logger.error(`Unexpected error answering question ${questionId}:`, error);
      return thunkAPI.rejectWithValue("An unexpected error occurred");
    }
  }
);

/**
 * Async thunk for fetching the explanation for a question
 * This is typically called after a user has answered a question
 */
export const fetchExplanation = createAsyncThunk(
  "questions/fetchExplanation",
  async (questionId: number, thunkAPI) => {
    try {
      Logger.info(`Fetching explanation for question ${questionId}`);
      const response = await axios.get(
        `/learn/api/questions/${questionId}/explanation`
      );
      Logger.debug(
        `Explanation response for question ${questionId}:`,
        response.data
      );
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        Logger.error(
          `Error fetching explanation for question ${questionId}:`,
          error.response?.data?.message || error.message
        );
        return thunkAPI.rejectWithValue(
          error.response?.data?.message || error.message
        );
      }
      Logger.error(
        `Unexpected error fetching explanation for question ${questionId}:`,
        error
      );
      return thunkAPI.rejectWithValue("An unexpected error occurred");
    }
  }
);

interface FavoriteQuestionPayloadProps {
  questionId: number;
  sessionId: string;
}

const POLLING_INTERVAL = 1000; // 1 second
const MAX_POLLING_TIME = 10000; // 10 seconds

export const favoriteQuestion = createAsyncThunk(
  "questions/favoriteQuestion",
  async ({ questionId, sessionId }: FavoriteQuestionPayloadProps, thunkAPI) => {
    try {
      Logger.info(`Favoriting question ${questionId}`);
      const response = await axios.post(
        `/learn/api/questions/${questionId}/favorite`,
        {
          sessionId,
        }
      );
      Logger.debug(
        `Favorite response for question ${questionId}:`,
        response.data
      );

      // Get the current number of questions
      const state = thunkAPI.getState() as { questions: QuestionsState };
      const initialQuestionCount = state.questions.questions.length;

      // Start polling for new questions
      const startTime = Date.now();
      while (Date.now() - startTime < MAX_POLLING_TIME) {
        await new Promise((resolve) => setTimeout(resolve, POLLING_INTERVAL));

        const response = await axios.get(
          `/learn/api/questions?sessionId=${sessionId}`
        );
        const newQuestions = response.data.payload.questions;

        if (newQuestions.length > initialQuestionCount) {
          Logger.info(`New questions received after favoriting`);
          return { ...response.data, newQuestions };
        }
      }

      Logger.warn(
        `No new questions received after favoriting within the timeout`
      );
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        Logger.error(
          `Error favoriting question ${questionId}:`,
          error.response?.data?.message || error.message
        );
        return thunkAPI.rejectWithValue(
          error.response?.data?.message || error.message
        );
      }
      Logger.error(
        `Unexpected error favoriting question ${questionId}:`,
        error
      );
      return thunkAPI.rejectWithValue("An unexpected error occurred");
    }
  }
);

// Interface for the loading state of individual questions
interface LoadingState {
  [key: string]: boolean;
}

// Interface for the entire questions state
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

/**
 * Redux slice for managing questions
 * This includes reducers for setting questions, answering questions,
 * managing favorited and historical questions, and handling explanations
 */
const questionsSlice = createSlice({
  name: "questions",
  initialState,
  reducers: {
    setQuestions(state, action: PayloadAction<Question[]>) {
      Logger.info(`Setting ${action.payload.length} questions`);
      state.questions = action.payload;
    },
    addQuestion(state, action: PayloadAction<Question>) {
      Logger.info(`Adding new question: ${action.payload._id}`);
      state.questions.unshift(action.payload);
    },
    setFavoritedQuestions(state, action: PayloadAction<Question[]>) {
      Logger.info(`Setting ${action.payload.length} favorited questions`);
      state.favoritedQuestions = action.payload;
    },
    addHistoricalQuestion(state, action: PayloadAction<HistoricalQuestion>) {
      Logger.info(`Adding historical question: ${action.payload.question._id}`);
      state.historicalQuestions.push(action.payload);
    },
    answerClientSideQuestion(
      state,
      action: PayloadAction<AnswerQuestionPayloadProps>
    ) {
      const { questionId, selectedChoice } = action.payload;
      Logger.info(
        `Answering question ${questionId} client-side with choice ${selectedChoice}`
      );
      const question = state.questions.find((q) => q._id === questionId);

      if (!question) {
        Logger.warn(
          `Question ${questionId} not found for client-side answering`
        );
        return;
      }

      question.selectedChoice = selectedChoice;
      question.isCorrect = selectedChoice === question.correctChoice;
      Logger.debug(
        `Question ${questionId} answered client-side. Correct: ${question.isCorrect}`
      );
    },
    setExplanation(
      state,
      action: PayloadAction<{ questionId: number; explanation: string }>
    ) {
      const { questionId, explanation } = action.payload;
      Logger.info(`Setting explanation for question ${questionId}`);
      const question = state.questions.find((q) => q._id === questionId);
      if (question) {
        question.explanation = explanation;
        Logger.debug(`Explanation set for question ${questionId}`);
      } else {
        Logger.warn(
          `Question ${questionId} not found when setting explanation`
        );
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(answerQuestion.pending, (state, action) => {
        const { questionId } = action.meta.arg;
        Logger.info(`Answer pending for question ${questionId}`);
        state.loading[questionId] = true;
        state.error = null;
      })
      .addCase(answerQuestion.fulfilled, (state, action) => {
        const { questionId } = action.meta.arg;
        Logger.info(`Answer fulfilled for question ${questionId}`);
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
              Logger.debug(`Updated question ${questionId} in state`);
            } else {
              Logger.warn(
                `Question ${questionId} not found in state for update`
              );
            }
          } else {
            Logger.warn(`Updated question ${questionId} not found in payload`);
          }
        } else {
          Logger.warn(
            `No questions in payload for answer to question ${questionId}`
          );
        }
      })
      .addCase(answerQuestion.rejected, (state, action) => {
        const { questionId } = action.meta.arg;
        Logger.error(
          `Answer rejected for question ${questionId}:`,
          action.payload
        );
        state.loading[questionId] = false;
        state.error = action.payload as string;
      })
      .addCase(fetchExplanation.fulfilled, (state, action) => {
        const { questionId, explanation } = action.payload;
        Logger.info(`Explanation fetched for question ${questionId}`);
        const question = state.questions.find((q) => q._id === questionId);
        if (question) {
          question.explanation = explanation;
          Logger.debug(`Explanation set for question ${questionId}`);
        } else {
          Logger.warn(
            `Question ${questionId} not found when setting fetched explanation`
          );
        }
      })
      .addCase(favoriteQuestion.pending, (state, action) => {
        const { questionId } = action.meta.arg;
        Logger.info(`Favorite pending for question ${questionId}`);
        state.loading[questionId] = true;
        state.error = null;
      })
      .addCase(favoriteQuestion.fulfilled, (state, action) => {
        const { favoritedQuestionId } = action.payload;
        Logger.info(`Favorite fulfilled for question ${favoritedQuestionId}`);
        state.loading[favoritedQuestionId] = false;
        state.error = null;

        if (action.payload.newQuestions) {
          state.questions = action.payload.newQuestions.map((q: Question) => ({
            ...q,
            favorited: q._id === favoritedQuestionId ? true : q.favorited,
          }));
          Logger.info(`Updated questions after favoriting`);
        } else {
          // If no new questions, just update the favorited status of the existing question
          const question = state.questions.find(
            (q) => q._id === favoritedQuestionId
          );
          if (question) {
            question.favorited = true;
            Logger.debug(`Marked question ${favoritedQuestionId} as favorited`);
          } else {
            Logger.warn(
              `Question ${favoritedQuestionId} not found when marking as favorited`
            );
          }
        }
      })
      .addCase(favoriteQuestion.rejected, (state, action) => {
        const { questionId } = action.meta.arg;
        Logger.error(
          `Favorite rejected for question ${questionId}:`,
          action.payload
        );
        state.loading[questionId] = false;
        state.error = action.payload as string;
      });
  },
});

// Export individual action creators
export const {
  setQuestions,
  setFavoritedQuestions,
  addHistoricalQuestion,
  answerClientSideQuestion,
  setExplanation,
} = questionsSlice.actions;

// Export the reducer
export default questionsSlice.reducer;
