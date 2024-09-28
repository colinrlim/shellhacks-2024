// knowledgeSlice.ts

import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface Topic {
  description: string;
  relationships: {
    child_topic: string;
    strength: number;
  }[];
}

interface KnowledgeState {
  topics: Record<string, Topic>;
  currentTopic: string | null;
  // knowledgeTree: Record<string, string[]>;
}

const initialState: KnowledgeState = {
  topics: {},
  currentTopic: null,
};

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
});

export const { setTopics, setCurrentTopic } = knowledgeSlice.actions;

export default knowledgeSlice.reducer;
