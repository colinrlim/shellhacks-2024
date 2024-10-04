// @/models/Adminuser

// Import
import mongoose, { Document, Model } from "mongoose";

// User interface
/**
 * This defines the interface of a user.
 */
export interface IAdminUser extends Document {
  accountId: mongoose.Types.ObjectId | undefined;
  role: string;
  overrideMaxQuestions?: number;
}

// User Schema
/**
 * This defines the Mongoose schema of a user based on the IUser interface.
 */
const UserSchema = new mongoose.Schema<IAdminUser>({
  accountId: { type: mongoose.Types.ObjectId, required: true },
  role: { type: String, required: true },
  overrideMaxQuestions: { type: Number },
});

// Handle model cache
/**
 * This handles the model cache to prevent model overwrite.
 */
if (mongoose.models.AdminUser) {
  delete mongoose.models.AdminUser;
}

// Create and export the model
const AdminUser: Model<IAdminUser> =
  mongoose.models.AdminUser ||
  mongoose.model<IAdminUser>("AdminUser", UserSchema);

export default AdminUser;
