import mongoose, { Document, Model } from "mongoose";

export interface IQuestion extends Document {
  topic: string;
  question: string;
  choices: Record<"1" | "2" | "3" | "4", string>;
  correctChoice: number;
  createdAt: Date;
  createdBy: string;
  sessionId: string;
}

const QuestionSchema = new mongoose.Schema<IQuestion>({
  topic: { type: String, required: true },
  question: { type: String, required: true },
  choices: {
    type: {
      "1": { type: String, required: true },
      "2": { type: String, required: true },
      "3": { type: String, required: true },
      "4": { type: String, required: true },
    },
    required: true,
  },
  correctChoice: { type: Number, required: true, min: 1, max: 4 }, // Corrected
  createdAt: { type: Date, default: Date.now },
  createdBy: { type: String, required: true },
  sessionId: { type: String, required: true },
});

// Clear model cache if necessary
if (mongoose.models.Question) {
  delete mongoose.models.Question;
}

const Question: Model<IQuestion> =
  mongoose.models.Question ||
  mongoose.model<IQuestion>("Question", QuestionSchema);

export default Question;
