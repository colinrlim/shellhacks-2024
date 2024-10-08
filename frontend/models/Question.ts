// @/models/Question

// Imports
import mongoose, { Document, Model } from "mongoose";

// Question Interface Definition
/**
 * This defines the structure of a question in the database.
 */
export interface IQuestion extends Document {
  question: string;
  choices: Record<"1" | "2" | "3" | "4", string>;
  correctChoice: number;
  selectedChoice?: number;
  isCorrect?: boolean;
  createdAt: Date;
  createdBy: string;
  sessionId: string;
  explanation?: string;
  favorited?: boolean;
}

// Question Schema
/**
 * This defines the Mongoose schema of a question based on the IQuestion interface.
 */
const QuestionSchema = new mongoose.Schema<IQuestion>({
  question: { type: String, required: true },
  choices: {
    type: {
      "1": { type: String, required: true },
      "2": { type: String, required: true },
      "3": { type: String, required: false },
      "4": { type: String, required: false },
    },
    required: true,
  },
  selectedChoice: { type: Number, min: 1, max: 4 },
  isCorrect: { type: Boolean },
  correctChoice: { type: Number, required: true, min: 1, max: 4 }, // Corrected
  createdAt: { type: Date, default: Date.now },
  createdBy: { type: String, required: true },
  sessionId: { type: String, required: true },
  explanation: { type: String },
  favorited: { type: Boolean },
});

// Model Cache Management
if (mongoose.models.Question) {
  delete mongoose.models.Question;
}

// Model Creation
const Question: Model<IQuestion> =
  mongoose.models.Question ||
  mongoose.model<IQuestion>("Question", QuestionSchema);

export default Question;
