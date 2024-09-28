import mongoose, { Document, model } from "mongoose";

// Define the relationship schema
const RelationshipSchema = new mongoose.Schema({
  child_topic: {
    type: String, // Storing the key as a string since it's an actual key
    required: true,
  },
  strength: {
    type: Number,
    required: true,
  },
});

// Define the topic schema
const TopicSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  relationships: {
    description: {
      type: String,
      default: "All listed relationships are to child_topics of this topic.",
    },
    value: {
      type: [RelationshipSchema],
      default: [],
    },
  },
  createdBy: {
    type: String,
    required: true,
  },
  sessionId: {
    type: String,
    required: true,
  },
});

// Create a model interface for Topic
export interface ITopic extends Document {
  name: string;
  description: string;
  relationships: {
    description: string;
    value: {
      child_topic: string;
      strength: number;
    }[];
  };
  createdBy: string;
  sessionId: string;
}

// Create and export the model
const Topic =
  mongoose.models.Topic || mongoose.model<ITopic>("Topic", TopicSchema);
export default Topic;
