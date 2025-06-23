import { Types } from "mongoose";

export interface SubCommentBody {
  commentId: Types.ObjectId;
  title: string;
  message: string;
}
