import mongoose, { Document, Schema, Types } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
export interface UserDocument extends Document {
  _id: string;
  fullName: string;
  userName: string;
  email: string;
  password: string;
  contactNumber: string;
  isDeleted: boolean;
  profileImage?: string;
  refreshToken: string;
  role: string;
  resetPasswordToken?: string;
  resetPasswordTokenExpiry?: Date;
  isEmailVerified: boolean;
  emailVerificationToken: string;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(password: string): Promise<boolean>;
  generateAccessToken(): string;
  generateRefreshToken(): string;
}

export enum USERROLE {
  ADMIN = "admin",
  USER = "user",
}

const userSchema = new Schema<UserDocument>(
  {
    email: {
      required: true,
      type: String,
      unique: true,
    },
    fullName: {
      type: String,
      required: true,
    },
    userName: {
      type: String,
      required: true,
    },
    contactNumber: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    isDeleted: {
      type: Boolean,
    },
    role: {
      type: String,
      enum: Object.values(USERROLE),
      default: USERROLE.USER,
    },
    refreshToken: {
      type: String,
    },
    resetPasswordToken: {
      type: String,
    },
    resetPasswordTokenExpiry: {
      type: Date,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: {
      type: String,
    },
    profileImage: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  const user = this as UserDocument;
  if (!user.isModified("password")) {
    return next();
  } else {
    try {
      user.password = await bcrypt.hash(user.password, 12);
      next();
    } catch (err: any) {
      throw new Error(err);
    }
  }
});

userSchema.methods.comparePassword = async function (
  password: string
): Promise<boolean> {
  const user = this as UserDocument;
  return await bcrypt.compare(password, user.password);
};

userSchema.methods.generateAccessToken = function (): string {
  const user = this as UserDocument;
  const token = process.env.ACCESS_TOKEN;
  if (!token) {
    throw new Error("Access token is missing");
  }
  return jwt.sign(
    {
      userId: user?._id,
      email: user?.email,
      fullName: user?.fullName,
    },
    token,
    {
      expiresIn: "1h",
    }
  );
};

userSchema.methods.generateRefreshToken = function (): string {
  const user = this as UserDocument;
  const token = process.env.REFRESH_TOKEN;
  if (!token) {
    throw new Error("Refresh token is missing");
  }
  return jwt.sign(
    {
      userId: user?._id,
      email: user?.email,
      fullName: user?.fullName,
    },
    token,
    {
      expiresIn: "10h",
    }
  );
};

export const User = mongoose.model<UserDocument>("User", userSchema);
