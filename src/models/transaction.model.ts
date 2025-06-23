import mongoose, { Types, Document, Schema } from "mongoose";

export interface TransactionDocument extends Document {
  _id: string;
  userId: Types.ObjectId;
  amount: number;
  type: string;
  category: string;
  description: string;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

export enum TRANS_TYPE {
  INCOME = "income",
  EXPENSE = "expense",
}

const transactionSchema = new Schema<TransactionDocument>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      enum: Object.values(TRANS_TYPE),
    },
    category: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      default: Date.now(),
    },
  },
  {
    timestamps: true,
  }
);

export const Transaction = mongoose.model<TransactionDocument>(
  "Transaction",
  transactionSchema
);
