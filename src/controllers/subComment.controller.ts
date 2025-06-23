import express from "express";
import { SubComment } from "../models/subcomment.model";
import { asyncHandler, sendError, sendSuccess } from "../utils/function";
import { SubCommentBody } from "../helpers/subComments.helper";

export const addNewSubComment = asyncHandler(
  async (
    req: express.Request<{}, {}, SubCommentBody>,
    res: express.Response
  ): Promise<express.Response> => {
    const { commentId, title, message } = req.body;
    const user = req.user?.userId;

    const subCommentCreation = await SubComment.create({
      commentId,
      title,
      message,
      writtenBy: user,
    });

    if (subCommentCreation) {
      return sendSuccess(
        res,
        200,
        "Sub comment added successfully.",
        subCommentCreation
      );
    } else {
      return sendError(res, 400, "Sorry, the subcomment cant be added.");
    }

    try {
    } catch (err: any) {
      console.log(err);
      return sendError(res, 500, "Internal server error.");
    }
  }
);
