import express from "express";
import { redisClient } from "../utils/redis";

import {
  allowedFieldsByRole,
  asyncHandler,
  filterFields,
  sendError,
  sendSuccess,
} from "../utils/function";

import { User } from "../models/user.model";
import mongoose from "mongoose";
import { TodoBody, TodoSearchBody } from "../utils/interfaceHelper";
import { Todos, TodosDocument } from "../models/todos.model";

export const addNewTodo = asyncHandler(
  async (
    req: express.Request<{}, {}, TodoBody>,
    res: express.Response
  ): Promise<express.Response> => {
    try {
      const { title, description, status, priority, assignedTo, dueDate } =
        req.body;
      const user = req.user?.userId;
      const currentUser = await User.findById(user);
      if (!currentUser) {
        return sendError(res, 404, "No user found");
      }
      let assignedUserId: mongoose.Types.ObjectId | string =
        new mongoose.Types.ObjectId(currentUser?._id);
      if (currentUser?.role === "admin" && assignedTo) {
        assignedUserId = assignedTo;
      }
      const todoCreation = await Todos.create({
        title,
        description,
        status,
        priority,
        assignedTo: assignedUserId,
        assignedBy: user,
        dueDate,
      });

      if (todoCreation) {
        return sendSuccess(res, 200, "Todo added successfully", todoCreation);
      } else {
        return sendError(res, 400, "Sorry, the todo cant be added");
      }
    } catch (err: any) {
      console.log(err);
      return sendError(res, 500, "Internal server error.");
    }
  }
);

export const getAllTodos = asyncHandler(
  async (
    req: express.Request<{}, {}, TodoSearchBody>,
    res: express.Response
  ): Promise<express.Response> => {
    try {
      const user = req.user?.userId;
      const userDetail = await User.findById(user);
      const page = req.body.page || 1;
      const limit = req.body.limit || 10;
      const skip = (page - 1) * limit;
      const sortBy = req.body.sortBy || "createdAt";
      const sortOrder = req.body.sortOrder === "asc" ? 1 : -1;
      const search = req.body.search;

      const redisKey = `todos:${user}:page:${page}:limit:${limit}`;

      const searchFilter = search
        ? {
            $or: [
              {
                title: { $regex: search, $options: "i" },
              },
              {
                description: { $regex: search, $options: "i" },
              },
            ],
          }
        : {};

      const matchStage = {
        ...(userDetail?.role === "admin"
          ? {}
          : { assignedTo: userDetail?._id }),
        ...searchFilter,
      };

      const cachedData = await redisClient.get(redisKey);
      if (cachedData) {
        const parsedData = JSON.parse(cachedData);
        return sendSuccess(res, 200, "Todo list", parsedData);
      }

      const todoDetails = await Todos.aggregate([
        {
          $match: matchStage,
        },
        {
          $lookup: {
            from: "users",
            localField: "assignedTo",
            foreignField: "_id",
            as: "userDetails",
            pipeline: [
              {
                $project: {
                  userName: 1,
                  fullName: 1,
                  email: 1,
                },
              },
            ],
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "assignedBy",
            foreignField: "_id",
            as: "adminDetails",
            pipeline: [
              {
                $project: {
                  userName: 1,
                  fullName: 1,
                  email: 1,
                },
              },
            ],
          },
        },
        {
          $lookup: {
            from: "comments",
            localField: "_id",
            foreignField: "todoId",
            as: "commentDetails",
            pipeline: [
              {
                $lookup: {
                  from: "users",
                  localField: "writtenBy",
                  foreignField: "_id",
                  as: "addedByDetails",
                  pipeline: [
                    {
                      $project: {
                        fullName: 1,
                        userName: 1,
                        email: 1,
                      },
                    },
                  ],
                },
              },
              {
                $addFields: {
                  addedByDetails: {
                    $first: "$addedByDetails",
                  },
                },
              },
              {
                $lookup: {
                  from: "subcomments",
                  localField: "_id",
                  foreignField: "commentId",
                  as: "subComments",
                  pipeline: [
                    {
                      $lookup: {
                        from: "users",
                        localField: "writtenBy",
                        foreignField: "_id",
                        as: "writtenByDetails",
                        pipeline: [
                          {
                            $project: {
                              fullName: 1,
                              userName: 1,
                              email: 2,
                            },
                          },
                        ],
                      },
                    },
                    {
                      $addFields: {
                        writtenbyDetails: {
                          $first: "$writtenByDetails",
                        },
                      },
                    },
                  ],
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
            adminDetails: {
              $first: "$adminDetails",
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

      const totalTodosDocuments = await Todos.countDocuments(matchStage);
      if (todoDetails.length === 0) {
        return sendError(res, 404, "No todo found");
      } else {
        const result = {
          data: todoDetails,
          pagination: {
            total: totalTodosDocuments,
            page,
            limit,
            totalPage: Math.ceil(totalTodosDocuments / limit),
          },
        };

        await redisClient.setEx(redisKey, 3600, JSON.stringify(result));

        return sendSuccess(res, 200, "Todo list", result);
      }
    } catch (err: any) {
      console.log(err);
      return sendError(res, 500, "Internal server error.");
    }
  }
);

export const updateTodo = asyncHandler(
  async (
    req: express.Request<{ todoId: string }, {}, Partial<TodosDocument>>,
    res: express.Response
  ): Promise<express.Response> => {
    try {
      const todoId = req.params.todoId;
      const user = req.user?.userId;
      const userDetail = await User.findById(user);
      if (!todoId) {
        return sendError(res, 400, "No todo found");
      }

      type Role = keyof typeof allowedFieldsByRole;
      const role = userDetail?.role as Role;
      if (!(role in allowedFieldsByRole)) {
        return sendError(res, 403, "Invalid role");
      }
      const allowedFields = allowedFieldsByRole[role];
      const updateData = filterFields(req.body, allowedFields);
      const updateTodos = await Todos.findByIdAndUpdate(todoId, updateData, {
        new: true,
      });
      if (updateTodos) {
        return sendSuccess(res, 200, "Todos updated", updateTodos);
      } else {
        return sendError(res, 400, "Sorry, the todos can not be updated.");
      }
    } catch (err: any) {
      console.log(err);
      return sendError(res, 500, "Internal server error");
    }
  }
);
