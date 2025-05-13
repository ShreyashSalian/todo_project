import mongoose, { Types, Document, Schema } from "mongoose";
export interface TodosDocument extends Document {
  _id: string;
  title: string;
  description: string;
  priority: string;
  status: string;
  assignedTo: Types.ObjectId;
  assignedBy: Types.ObjectId;
  dueDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

export enum statusenum {
  PENDING = "pending",
  INPROGRESS = "inprogress",
  COMPLETED = "completed",
}

export enum priorityenum {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
}

const todosSchema = new Schema<TodosDocument>(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    priority: {
      type: String,
      enum: Object.values(priorityenum),
      default: priorityenum.LOW,
    },
    status: {
      type: String,
      enum: Object.values(statusenum),
      default: statusenum.PENDING,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    dueDate: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Todos = mongoose.model<TodosDocument>("Todo", todosSchema);
