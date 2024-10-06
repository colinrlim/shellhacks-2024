import mongoose, { Document, Model } from "mongoose";

export interface ISettings extends Document {
  userId: mongoose.Types.ObjectId | undefined; // User._id
  account: {
    name: string;
    email: string;
  };
  security: {
    twoFactorEnabled: boolean;
    emailVerificationCode?: string;
    emailVerified?: boolean;
    passwordResetConfirmationCode?: string;
  };
  interface: {
    theme: "light" | "dark";
    fontSize: "small" | "medium" | "large";
    language: "en";
  };
  data: {
    dataExportRequested: boolean;
  };
  legal: {
    marketingConsent: boolean;
  };
}

const SettingsSchema = new mongoose.Schema<ISettings>({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  account: {
    name: { type: String },
    email: { type: String, required: true },
  },
  security: {
    twoFactorEnabled: { type: Boolean, required: true },
    emailVerificationCode: { type: String },
    emailVerified: { type: Boolean },
    passwordResetConfirmationCode: { type: String },
  },
  interface: {
    theme: { type: String, enum: ["light", "dark"], required: true },
    fontSize: {
      type: String,
      enum: ["small", "medium", "large"],
      required: true,
    },
    language: { type: String, enum: ["en"], required: true },
  },
  data: {
    dataExportRequested: { type: Boolean, required: true },
  },
  legal: {
    marketingConsent: { type: Boolean, required: true },
  },
});

const Settings: Model<ISettings> =
  mongoose.models.Settings ||
  mongoose.model<ISettings>("Settings", SettingsSchema);

export default Settings;
