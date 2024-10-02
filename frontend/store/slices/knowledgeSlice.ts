// @/store/slices/knowledgeSlice
/**
 * This is the knowledge slice of the Redux store.
 * It contains the knowledge state and reducers for setting topics and the current topic.
 */

// Imports
import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { setQuestions } from "./questionsSlice"; // Adjust the path as necessary

// Topic interface
interface Topic {
  description: string;
  relationships: {
    desccription: string;
    value: {
      child_topic: string;
      strength: number;
    }[];
  }[];
}

// Knowledge state interface
interface KnowledgeState {
  topics: Record<string, Topic>;
  currentTopic: string | null;
  loading: boolean;
  error: string | null;
  sessionActive: boolean;
}

// Initial state of knowledge slice
const initialState: KnowledgeState = {
  topics: {},
  currentTopic: null,
  loading: false,
  error: null,
  sessionActive: false,
};

// Payload for starting a session
interface StartSessionPayloadProps {
  topic: string;
  sessionId: string;
}

// Async thunk to start a session
export const startSession = createAsyncThunk(
  "knowledge/startSession", // Slice name
  async (payload: StartSessionPayloadProps, { dispatch, rejectWithValue }) => {
    const { topic, sessionId } = payload;
    try {
      // Send PUT request to start the session
      const response = await axios.put("/api/questions/startSession", {
        topic,
        sessionId,
      });
      const { data } = response;
      console.log(data);

      // Set the current topic
      dispatch(setCurrentTopic(topic));

      // If questions were updated, dispatch setQuestions
      // if (data.updateFlags.questions) {
      //   dispatch(setQuestions(data.payload.questions));
      //   dispatch(getQuestions({ sessionId, topic }));
      // }

      return data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.log(error);
        return rejectWithValue(error.response?.data?.message || error.message);
      }
    }
  }
);

export const getQuestions = createAsyncThunk(
  "knowledge/getQuestions",
  async (payload: StartSessionPayloadProps, { dispatch, rejectWithValue }) => {
    const { sessionId } = payload;
    try {
      // Send PUT request to start the session
      const response = await axios.get(`/api/questions?sessionId=${sessionId}`);
      const { data } = response;
      console.log(data);

      // If questions were updated, dispatch setQuestions
      if (data.updateFlags.questions) {
        dispatch(setQuestions(data.payload.questions));
      }

      // If topics were updated, dispatch setTopics
      if (data.updateFlags.topics) {
        dispatch(setTopics(data.payload.topics));
      }

      return data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.log(error);
        return rejectWithValue(error.response?.data?.message || error.message);
      }
    }
  }
);

// Knowledge slice
const knowledgeSlice = createSlice({
  name: "knowledge",
  initialState,
  reducers: {
    setTopics(state, action: PayloadAction<Record<string, Topic>>) {
      state.topics = action.payload;
    },
    setCurrentTopic(state, action: PayloadAction<string>) {
      state.currentTopic = action.payload;
    },
    resetSession(state) {
      state.sessionActive = false;
      state.currentTopic = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(startSession.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(startSession.fulfilled, (state) => {
        state.loading = false;
        state.sessionActive = true;
        // Call getQuestions to get the questions for the session
      })
      .addCase(startSession.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setTopics, setCurrentTopic, resetSession } =
  knowledgeSlice.actions;

export default knowledgeSlice.reducer;
