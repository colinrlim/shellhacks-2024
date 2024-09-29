import mongoose, { Document, Model } from "mongoose";

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
}

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
});

// Clear model cache if necessary
if (mongoose.models.Question) {
  delete mongoose.models.Question;
}

const Question: Model<IQuestion> =
  mongoose.models.Question ||
  mongoose.model<IQuestion>("Question", QuestionSchema);

export default Question;
