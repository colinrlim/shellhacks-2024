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
  relationships: [RelationshipSchema],
  createdBy: {
    type: String,
    required: true,
  },
});

// Create a model interface for Topic
export interface ITopic extends Document {
  name: string;
  description: string;
  relationships: {
    child_topic: string; // The key as a string
    strength: number;
  }[];
  createdBy: string;
}

// Create and export the model
const Topic =
  mongoose.models.Topic || mongoose.model<ITopic>("Topic", TopicSchema);
export default Topic;
