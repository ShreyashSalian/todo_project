import express from "express";

import { commentValidation } from "../validations/comment.validation";
import { verifyUser } from "../middlewares/auth.middleware";
import { validateApi } from "../middlewares/validation.middleware";
import { addNewComment } from "../controllers/coment.controller";

const commentRoutes = express.Router();
commentRoutes.post(
  "/",
  verifyUser,
  commentValidation(),
  validateApi,
  addNewComment
);

export default commentRoutes;
