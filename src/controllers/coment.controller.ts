import express from "express";
import { Comment } from "../models/comment.model";
import { asyncHandler } from "../utils/function";
import { CommentBody } from "../utils/interfaceHelper";

export const addNewComment = asyncHandler(
  async (
    req: express.Request<{}, {}, CommentBody>,
    res: express.Response
  ): Promise<express.Response> => {
    const { todoId, title, description } = req.body;
    const user = req.user?.userId;
    const commentCreation = await Comment.create({
      todoId,
      title,
      description,
      createdBy: user,
    });
    if (commentCreation) {
      return res.status(200).json({
        message: "Comment created successfully",
        error: null,
        data: commentCreation,
        status: 200,
      });
    } else {
      return res.status(200).json({
        message: null,
        error: "Sorry, the comment can not be created.",
        data: null,
        status: 200,
      });
    }
  }
);
