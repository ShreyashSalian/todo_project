import mongoose, { Types, Schema, Document } from "mongoose";

export interface BudgetDocument extends Document {
  _id: string;
  userId: Types.ObjectId;
  category: string;
  amount: number;
  month: number;
  year: number;
  createdAt: Date;
  updatedAt: Date;
}

const budgetSchema = new Schema<BudgetDocument>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    category: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    month: {
      type: Number,
      required: true,
    },
    year: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Budget = mongoose.model<BudgetDocument>("Budget", budgetSchema);
