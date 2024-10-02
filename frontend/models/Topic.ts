// @/models/Topic

// Imports
import mongoose, { Document, Model } from "mongoose";

export interface IRelationship {
  child_topic: string;
  strength: number;
}

// Topic Interface Definition
/**
 * This defines the structure of a topic in the database.
 */
export interface ITopic extends Document {
  name: string;
  description: string;
  relationships: IRelationship[];
  createdBy: string;
  sessionId: string;
}

// Relationship Schema
/**
 * This defines the Mongoose schema of a relationship based on the IRelationship interface.
 */
const RelationshipSchema = new mongoose.Schema<IRelationship>(
  {
    child_topic: {
      type: String,
      required: true,
    },
    strength: {
      type: Number,
      required: true,
    },
  },
  {
    toObject: { virtuals: true },
  }
);

// Topic Schema
/**
 * This defines the Mongoose schema of a topic based on the ITopic interface.
 */
const TopicSchema = new mongoose.Schema<ITopic>({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  relationships: {
    type: [RelationshipSchema],
    default: [],
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
