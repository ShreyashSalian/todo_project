import express from "express";

import { verifyUser } from "../middlewares/auth.middleware";
import { subCommentValidation } from "../validations/subComment.validation";
import { addNewSubComment } from "../controllers/subComment.controller";
import { validateApi } from "../middlewares/validation.middleware";

const subCommentRouter = express.Router();
subCommentRouter.post(
  "/",
  verifyUser,
  subCommentValidation(),
  validateApi,
  addNewSubComment
);

export default subCommentRouter;
