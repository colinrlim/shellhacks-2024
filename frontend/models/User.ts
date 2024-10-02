// @/models/User

// Import
import mongoose, { Document, Model } from "mongoose";

// Explanation interface
/**
 * This defines the interface of an explanation.
 */
interface explanation {
  saved: boolean;
  explanation: string;
}

// User interface
/**
 * This defines the interface of a user.
 */
export interface IUser extends Document {
  auth0Id: string;
  name: string;
  email: string;
  latestExplanation?: explanation;
  currentTopic?: string;
  lastSubmitQuestion?: mongoose.Types.ObjectId;
}

// User Schema
/**
 * This defines the Mongoose schema of a user based on the IUser interface.
 */
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

// Handle model cache
/**
 * This handles the model cache to prevent model overwrite.
 */
if (mongoose.models.User) {
  delete mongoose.models.User;
}

// Create and export the model
const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
