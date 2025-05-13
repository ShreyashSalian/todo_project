import mongoose, { Document, Schema, Types } from "mongoose";

export interface LoginDocument extends Document {
  _id: string;
  userId: Types.ObjectId;
  token: string;
  email: string;
  refreshToken: string;
  createdAt: Date;
  updatedAt: Date;
}

const LoginSchema = new Schema<LoginDocument>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    token: {
      type: String,
      required: true,
    },
    refreshToken: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Login = mongoose.model<LoginDocument>("Login", LoginSchema);
