import express from "express";

import { verifyUser } from "../middlewares/auth.middleware";

import { upload } from "../middlewares/multer.middleware";
import { validateApi } from "../middlewares/validation.middleware";
import { categoryValidation } from "../validations/category.valiadation";

const categoryRoute = express.Router();
categoryRoute.post(
  "/",
  verifyUser,
  upload.single("categoryImage"),
  categoryValidation(),
  validateApi
);

export default categoryRoute;
