// models/User.ts
import mongoose, { Document, Model } from "mongoose";

export interface IUser extends Document {
  auth0Id: string;
  name: string;
  email: string;
}

const UserSchema = new mongoose.Schema<IUser>({
  auth0Id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
});

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
