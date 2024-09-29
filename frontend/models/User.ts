// models/User.ts
import mongoose, { Document, Model } from "mongoose";

interface explanation {
  saved: boolean;
  explanation: string;
}

export interface IUser extends Document {
  auth0Id: string;
  name: string;
  email: string;
  latestExplanation?: explanation;
  currentTopic?: string;
  lastSubmitQuestion?: mongoose.Types.ObjectId;
}

const UserSchema = new mongoose.Schema<IUser>({
  auth0Id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  latestExplanation: {
    saved: { type: Boolean, default: false },
    explanation: { type: String, default: "" },
  },
  currentTopic: { type: String },
  lastSubmitQuestion: { type: mongoose.Types.ObjectId },
});

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
