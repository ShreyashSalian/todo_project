import express from "express";
import { AdminUser, verifyUser } from "../middlewares/auth.middleware";

import { productValidator } from "../validations/product.validation";
import { addNewProduct } from "../controllers/product.controller";
import { upload } from "../middlewares/multer.middleware";
import { validateApi } from "../middlewares/validation.middleware";

const productRoute = express.Router();
productRoute.post(
  "/",
  verifyUser,
  AdminUser,
  upload.array("productImages", 10),
  productValidator(),
  validateApi,
  addNewProduct
);

export default productRoute;
