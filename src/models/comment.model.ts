import mongoose, { Types, Document, Schema } from "mongoose";

export interface CommentDocument extends Document {
  _id: string;
  todoId: Types.ObjectId;
  title: string;
  message: string;
  writtenBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const commentSchema = new Schema<CommentDocument>(
  {
    todoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Todos",
      required: true,
    },
    title: {
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

export const Comment = mongoose.model("Comment", commentSchema);
