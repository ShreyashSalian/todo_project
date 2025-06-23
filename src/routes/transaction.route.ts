import express from "express";
import { asyncHandler } from "../utils/function";

import { verifyUser } from "../middlewares/auth.middleware";
import { transactionValidation } from "../validations/transaction.validation";
import {
  addTransaction,
  deleteTransaction,
  getAllTransaction,
  updateTransaction,
} from "../controllers/transaction.controller";
import { validateApi } from "../middlewares/validation.middleware";

const transactionRoute = express.Router();
transactionRoute.post(
  "/",
  verifyUser,
  transactionValidation(),
  validateApi,
  addTransaction
);

transactionRoute.post("/search", verifyUser, getAllTransaction);
transactionRoute.put("/:transactionId", verifyUser, updateTransaction);
transactionRoute.delete("/:transactionId", verifyUser, deleteTransaction);

export default transactionRoute;
