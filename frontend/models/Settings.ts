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
    name: { type: String, default: "Learning User" },
    email: { type: String, required: true },
  },
  security: {
    twoFactorEnabled: { type: Boolean, default: false },
    emailVerificationCode: { type: String },
    emailVerified: { type: Boolean },
    passwordResetConfirmationCode: { type: String },
  },
  interface: {
    theme: {
      type: String,
      enum: ["light", "dark"],
      default: "light",
    },
    fontSize: {
      type: String,
      enum: ["small", "medium", "large"],
      default: "medium",
    },
    language: { type: String, enum: ["en"], default: "en" },
  },
  data: {
    dataExportRequested: { type: Boolean, default: false },
  },
  legal: {
    marketingConsent: { type: Boolean, default: false },
  },
});

// Model Cache Management
if (mongoose.models.Question) {
  delete mongoose.models.Question;
}

const Settings: Model<ISettings> =
  mongoose.models.Settings ||
  mongoose.model<ISettings>("Settings", SettingsSchema);

export default Settings;
