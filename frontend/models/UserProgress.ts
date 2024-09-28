// models/UserProgress.ts
import mongoose, { Document, Model } from "mongoose";

export interface IUserProgress extends Document {
  userId: mongoose.Types.ObjectId;
  questionId: mongoose.Types.ObjectId;
  isCorrect: boolean;
  answeredAt: Date;
}

const UserProgressSchema = new mongoose.Schema<IUserProgress>({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Question",
    required: true,
  },
  isCorrect: { type: Boolean, required: true },
  answeredAt: { type: Date, default: Date.now },
});

const UserProgress: Model<IUserProgress> =
  mongoose.models.UserProgress ||
  mongoose.model<IUserProgress>("UserProgress", UserProgressSchema);

export default UserProgress;
