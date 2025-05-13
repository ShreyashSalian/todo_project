import express from "express";

import { userValidation } from "../validations/user.validation";

import {
  addNewUser,
  getUserDetails,
  updateUserDetails,
} from "../controllers/user.controller";
import { verifyUser } from "../middlewares/auth.middleware";
import { validateApi } from "../middlewares/validation.middleware";
import { upload } from "../middlewares/multer.middleware";

const userRoutes = express.Router();
userRoutes.post(
  "/",
  upload.single("profileImage"),
  userValidation(),
  validateApi,
  addNewUser
);

userRoutes.put("/", verifyUser, updateUserDetails);
userRoutes.get("/", verifyUser, getUserDetails);

export default userRoutes;
