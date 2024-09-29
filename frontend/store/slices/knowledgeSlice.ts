// knowledgeSlice.ts

import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { setQuestions } from "./questionsSlice"; // Adjust the path as necessary

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

interface KnowledgeState {
  topics: Record<string, Topic>;
  currentTopic: string | null;
  loading: boolean;
  error: string | null;
  sessionActive: boolean;
}

const initialState: KnowledgeState = {
  topics: {},
  currentTopic: null,
  loading: false,
  error: null,
  sessionActive: false,
};

interface StartSessionPayloadProps {
  topic: string;
  sessionId: string;
}

// Async thunk to start a session
export const startSession = createAsyncThunk(
  "knowledge/startSession",
  async (payload: StartSessionPayloadProps, { dispatch, rejectWithValue }) => {
    let { topic, sessionId } = payload;
    try {
      // Send PUT request to start the session
      const response = await axios.put("/api/questions/startSession", {
        topic,
        sessionId,
      });
      const data = response.data;

      // Set the current topic
      dispatch(setCurrentTopic(topic));

      // If questions were updated, dispatch setQuestions
      if (data.updateFlags.questions) {
        dispatch(setQuestions(data.payload.questions));
      }

      return data;
    } catch (error: any) {
      // Handle error appropriately
      console.log(error);
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const getQuestions = createAsyncThunk(
  "knowledge/getQuestions",
  async (payload: StartSessionPayloadProps, { dispatch, rejectWithValue }) => {
    let { topic, sessionId } = payload;
    try {
      // Send PUT request to start the session
      const response = await axios.get(`/api/questions?sessionId=${sessionId}`);
      const data = response.data;

      // If questions were updated, dispatch setQuestions
      if (data.updateFlags.questions) {
        dispatch(setQuestions(data.payload.questions));
      }

      // If topics were updated, dispatch setTopics
      if (data.updateFlags.topics) {
        dispatch(setTopics(data.payload.topics));
      }

      return data;
    } catch (error: any) {
      // Handle error appropriately
      console.log(error);
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

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
  },
  extraReducers: (builder) => {
    builder
      .addCase(startSession.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(startSession.fulfilled, (state, action) => {
        state.loading = false;
        state.sessionActive = true;
        // You can handle additional state updates here if needed
      })
      .addCase(startSession.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setTopics, setCurrentTopic } = knowledgeSlice.actions;

export default knowledgeSlice.reducer;
