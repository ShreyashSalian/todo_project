import express from "express";
import { asyncHandler, sendError, sendSuccess } from "../utils/function";

import { Transaction } from "../models/transaction.model";
import { User } from "../models/user.model";
import mongoose from "mongoose";
import { Budget } from "../models/budget.model";
import {
  TransactionBody,
  TransactionSearchBody,
} from "../helpers/transaction.helper";

export const addTransaction = asyncHandler(
  async (
    req: express.Request<{}, {}, TransactionBody>,
    res: express.Response
  ): Promise<express.Response> => {
    try {
      const { amount, type, date, description, category } = req.body;
      const user = req.user?.userId;
      const transactionCreation = await Transaction.create({
        userId: user,
        amount,
        type,
        category,
        description,
        date,
      });

      let overSpent = false;
      let overSpentAmount = 0;

      if (type === "expense") {
        const txnDate = new Date(date || Date.now());
        const month = txnDate.getMonth() + 1;
        const year = txnDate.getFullYear();

        const [expense, budget] = await Promise.all([
          Transaction.aggregate([
            {
              $match: {
                userId: req.user?.userId,
                type: "expense",
                category,
                date: {
                  $gte: new Date(year, month - 1, 1),
                  $lte: new Date(year, month, 0, 23, 59, 50),
                },
              },
            },
            {
              $group: {
                _id: null,
                totalSpent: {
                  $sum: "$amount",
                },
              },
            },
          ]),
          Budget.findOne({ userId: req.user?.userId, category, month, year }),
        ]);
        const totalSpent = expense[0]?.totalSpent || 0;
        if (budget && totalSpent > budget.amount) {
          overSpent = true;
          overSpentAmount = totalSpent - budget.amount;
        }
        if (overSpent) {
          let message = `You has extend your ${category} budget by ${overSpentAmount}`;
          return sendError(res, 400, message);
        }
      }

      if (transactionCreation) {
        return sendSuccess(
          res,
          200,
          "Transaction added successfully",
          transactionCreation
        );
      } else {
        return sendError(res, 400, "Sorry, the transaction can't be added.");
      }
    } catch (err: any) {
      console.log(err);
      return sendError(res, 500, "Internal server error.");
    }
  }
);

export const updateTransaction = asyncHandler(
  async (
    req: express.Request<{ transactionId: string }, {}, TransactionBody>,
    res: express.Response
  ): Promise<express.Response> => {
    try {
      const { amount, type, date, description, category } = req.body;
      const transactionId = req.params.transactionId;
      const userId = req.user?.userId;
      const transactionUpdate = await Transaction.findByIdAndUpdate(
        transactionId,
        {
          $set: {
            userId,
            amount,
            category,
            description,
            date,
          },
        },
        {
          new: true,
        }
      );
      if (transactionUpdate) {
        return sendSuccess(
          res,
          200,
          "Transaction updated successfully",
          transactionUpdate
        );
      } else {
        return sendError(
          res,
          400,
          "Transaction can not be updated successfully"
        );
      }
    } catch (err: any) {
      console.log(err);
      return sendError(res, 500, "Internal server server.");
    }
  }
);
export const deleteTransaction = asyncHandler(
  async (
    req: express.Request<{ transactionId: string }>,
    res: express.Response
  ): Promise<express.Response> => {
    try {
      const transactionId = req.params.transactionId;
      const user = req.user?.userId;
      const deleteTransaction = await Transaction.findOneAndDelete({
        userId: user,
        _id: transactionId,
      });
      if (deleteTransaction) {
        return sendSuccess(res, 200, "Transaction deleted successfully,", {});
      } else {
        return sendError(
          res,
          400,
          "Sorry, the transaction can not be deleted."
        );
      }
    } catch (err: any) {
      console.log(err);
      return sendError(
        res,
        500,
        `Sorry, the transaction can not be added ${err}`
      );
    }
  }
);

export const getAllTransaction = asyncHandler(
  async (
    req: express.Request<{}, {}, TransactionSearchBody>,
    res: express.Response
  ): Promise<express.Response> => {
    try {
      const user = req.user?.userId;
      const userDetail = await User.findById(user);
      if (!userDetail) {
        return sendError(res, 404, "Sorry, no user found");
      }
      const page = req.body.page || 1;
      const limit = req.body.limit || 10;
      const skip = (page - 1) * limit;
      const sortBy = req.body.sortOrder || "createdAt";
      const sortOrder = req.body.sortBy === "asc" ? 1 : -1;
      const search = req.body.search;

      const searchFilter = search
        ? {
            $or: [
              {
                description: { $regex: search, $options: "i" },
              },
              {
                type: { $regex: search, $options: "i" },
              },
              {
                category: { $regex: search, $options: "i" },
              },
            ],
          }
        : {};

      const matchStage = {
        ...(userDetail.role === "admin"
          ? {}
          : { userId: new mongoose.Types.ObjectId(user) }),
        ...searchFilter,
      };

      const transactionDetail = await Transaction.aggregate([
        {
          $match: matchStage,
        },
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "userDetails",
            pipeline: [
              {
                $project: {
                  userName: 1,
                  email: 1,
                  fullName: 1,
                },
              },
            ],
          },
        },
        {
          $addFields: {
            userDetails: {
              $first: "$userDetails",
            },
          },
        },
        {
          $sort: {
            [sortBy]: sortOrder,
          },
        },
        {
          $skip: skip,
        },
        {
          $limit: limit,
        },
      ]);

      const totalTransaction = await Transaction.countDocuments(matchStage);
      if (transactionDetail.length === 0) {
        return sendError(res, 400, "Sorry, there is no transaction");
      }
      return sendSuccess(res, 200, "Transaction list", {
        data: transactionDetail,
        pagination: {
          limit,
          page,
          total: totalTransaction,
          totalPage: Math.ceil(totalTransaction / limit),
        },
      });
    } catch (err: any) {
      console.log(err);
      return sendError(res, 500, "Internal server error.");
    }
  }
);
