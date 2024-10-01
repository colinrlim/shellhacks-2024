// @/models/Topic

// Imports
import mongoose, { Document, Model } from "mongoose";

// Topic Interface Definition
/**
 * This defines the structure of a topic in the database.
 */
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

// Relationship Schema
/**
 * This defines the structure of a relationship in the database.
 */
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

// Topic Schema
/**
 * This defines the Mongoose schema of a topic based on the ITopic interface.
 */
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

// Create and export the model
const Topic: Model<ITopic> =
  mongoose.models.Topic || mongoose.model<ITopic>("Topic", TopicSchema);
export default Topic;
