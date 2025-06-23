import express from "express";
import { verifyUser } from "../middlewares/auth.middleware";
import { addBudget, getBudget } from "../controllers/budget.controller";
import { budgetValidation } from "../validations/budget.validation";
import { validateApi } from "../middlewares/validation.middleware";

const budgetRoute = express.Router();

budgetRoute.post("/", verifyUser, budgetValidation(), validateApi, addBudget);
budgetRoute.post("/monthly", verifyUser, getBudget);

export default budgetRoute;
