import mongoose, { Types, Document, Schema } from "mongoose";

interface SubCommentDocument extends Document {
  _id: string;
  commentId: Types.ObjectId;
  title: string;
  message: string;
  writtenBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const subCommentSchema = new Schema<SubCommentDocument>(
  {
    commentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    writtenBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const SubComment = mongoose.model<SubCommentDocument>(
  "SubComment",
  subCommentSchema
);
