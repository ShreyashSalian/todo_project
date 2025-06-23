import express, { text } from "express";
import { asyncHandler, sendError, sendSuccess } from "../utils/function";
import { BudgetBody } from "../helpers/budget.helper";
import { Budget } from "../models/budget.model";
import { Transaction } from "../models/transaction.model";
import { truncates } from "bcryptjs";

export const addBudget = asyncHandler(
  async (
    req: express.Request<{}, {}, BudgetBody>,
    res: express.Response
  ): Promise<express.Response> => {
    try {
      const { category, amount, month, year } = req.body;
      const user = req.user?.userId;
      const budgetCreation = await Budget.create({
        userId: user,
        category,
        month,
        year,
        amount,
      });
      const budgetSave = await budgetCreation.save();
      if (budgetSave) {
        return sendSuccess(res, 200, "Budget created successfully.", {});
      } else {
        return sendError(res, 400, "Sorry, the budget cant be added.");
      }
    } catch (err: any) {
      console.log(err);
      return sendError(res, 500, "Internal server error.");
    }
  }
);

export const getBudget = asyncHandler(
  async (
    req: express.Request<{}, {}, { month: number; year: number }>,
    res: express.Response
  ): Promise<express.Response> => {
    try {
      const { year, month } = req.body;
      if (!year || !month) {
        return sendError(res, 400, "Pleaswe enter the month and year");
      }
      const start = new Date(year, month - 1, 1);
      const end = new Date(year, month, 0, 23, 59, 59);

      const transactionDetails = await Transaction.find({
        userId: req.user?.userId,
        date: {
          $gte: start,
          $lte: end,
        },
      });

      if (transactionDetails.length === 0) {
        return sendError(res, 400, "Sorry, no transaction found");
      }

      const budgetDetaisl = await Budget.find({
        userId: req.user?.userId,
        month,
        year,
      });

      let report: {
        [category: string]: {
          spent: number;
          income: number;
          budget: number;
          overSpent: boolean;
          overSpentAmount: number;
        };
      } = {};

      for (let txn of transactionDetails) {
        if (!report[txn.category]) {
          report[txn.category] = {
            spent: 0,
            income: 0,
            budget: 0,
            overSpent: false,
            overSpentAmount: 0,
          };
        }
        if (txn.category === "expense") {
          report[txn.category].spent += txn.amount;
        } else {
          report[txn.category].income += txn.amount;
        }
        if (report[txn.category].spent > report[txn.category].budget) {
          report[txn.category].overSpent = true;
          report[txn.category].overSpentAmount =
            report[txn.category].spent - report[txn.category].budget;
        }
      }
      for (let b of budgetDetaisl) {
        if (!report[b.category]) {
          report[b.category] = {
            spent: 0,
            income: 0,
            budget: 0,
            overSpent: false,
            overSpentAmount: 0,
          };
        }
        report[b.category].budget = b.amount;
      }
      return sendSuccess(res, 200, "Budget and transaction report", {
        month,
        year,
        report,
      });
    } catch (err: any) {
      console.log(err);
      return sendError(res, 500, "Internal server error.");
    }
  }
);
