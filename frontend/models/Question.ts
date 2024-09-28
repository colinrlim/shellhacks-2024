// models/Question.ts
import mongoose, { Document, Model } from "mongoose";

export interface IQuestion extends Document {
  topic: string;
  question: string;
  options: string[];
  correctAnswer: string;
  createdAt: Date;
}

const QuestionSchema = new mongoose.Schema<IQuestion>({
  topic: { type: String, required: true },
  question: { type: String, required: true },
  options: { type: [String], required: true },
  correctAnswer: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const Question: Model<IQuestion> =
  mongoose.models.Question ||
  mongoose.model<IQuestion>("Question", QuestionSchema);

export default Question;
