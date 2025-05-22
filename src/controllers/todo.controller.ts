import express from "express";
import { User } from "../models/user.model";
import { Todos } from "../models/todos.model";
import mongoose from "mongoose";
import { asyncHandler } from "../utils/function";
import {
  allowedFieldsByRole,
  filterFields,
  TodoBody,
  TodoSearchBody,
} from "../utils/interfaceHelper";
import { sendEmailReminder } from "../utils/email.service";

export const createTodo = asyncHandler(
  async (
    req: express.Request<{}, {}, TodoBody>,
    res: express.Response
  ): Promise<express.Response> => {
    const { title, description, status, priority, assignedTo, dueDate } =
      req.body;
    const user = req.user?.userId;
    const currentUser = await User.findById(user);
    if (!currentUser) {
      return res.status(401).json({
        message: null,
        error: "Unauthorized: User not found",
        status: 401,
        data: null,
      });
    }
    let assignedUserId: mongoose.Types.ObjectId = new mongoose.Types.ObjectId(
      currentUser._id
    ); // 👈 Convert ObjectId to string

    if (currentUser.role.includes("admin") && assignedTo) {
      assignedUserId = assignedTo;
    }
    console.log(assignedUserId);
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
      return res.status(200).json({
        message: "Todos has been created",
        data: todoCreation,
        status: 200,
        error: null,
      });
    } else {
      return res.status(400).json({
        message: null,
        data: null,
        status: 400,
        error: "Sorry, the todos can not be added",
      });
    }
  }
);
export const getAllTodos = asyncHandler(
  async (
    req: express.Request<{}, {}, TodoSearchBody>,
    res: express.Response
  ): Promise<express.Response> => {
    const user = req.user?.userId;
    const userDetails = await User.findById(user);
    if (!userDetails) {
      return res.status(401).json({
        message: null,
        error: "Sorry, no user found",
        status: 401,
        data: null,
      });
    }

    const page = req.body.page || 1;
    console.log(page, "------page");
    const limit = req.body.limit || 10;
    const skip = (page - 1) * limit;
    const sortBy = req.body.sortBy || "createdAt";
    const sortOrder = req.body.sortOrder === "asc" ? 1 : -1;
    const search = req.body.search;

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

    // const matchStage =
    //   userDetails?.role === "admin" ? {} : { assignedTo: userDetails?._id }
    // ;

    const matchStage = {
      ...(userDetails?.role === "admin"
        ? {}
        : { assignedTo: userDetails?._id }),
      ...searchFilter,
    };

    const todosDetails = await Todos.aggregate([
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
          from: "comments", // collection name in DB (lowercase plural)
          localField: "_id",
          foreignField: "todoId",
          as: "comments",
          pipeline: [
            {
              // $project: {
              //   title: 1,
              //   description: 1,
              //   todoId: 1,
              // },
              $lookup: {
                from: "users",
                localField: "createdBy",
                foreignField: "_id",
                as: "addedByDetails",
                pipeline: [
                  {
                    $project: {
                      fullName: 1,
                      role: 1,
                      userName: 1,
                      email: 2,
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

    const totalCount = await Todos.countDocuments(matchStage);
    if (todosDetails.length === 0) {
      return res.status(200).json({
        message: "Sorry, no todos found",
        data: null,
        error: null,
        status: 200,
      });
    } else {
      return res.status(200).json({
        message: "Todos details",
        data: todosDetails,
        pagination: {
          total: totalCount,
          page,
          limit,
          totalPages: Math.ceil(totalCount / limit),
        },
        error: null,
        status: 200,
      });
    }

    // if (todosDetails.length > 0) {
    //   return res.status(200).json({
    //     message: "Todos details",
    //     data: todosDetails,
    //     error: null,
    //     status: 200,
    //   });
    // } else {
    //   return res.status(200).json({
    //     message: null,
    //     data: null,
    //     error: "Sorry, no todos found",
    //     status: 200,
    //   });
    // }
  }
);

export const updateTodos = asyncHandler(
  async (
    req: express.Request<{ todoId: string }, {}, TodoBody>,
    res: express.Response
  ): Promise<express.Response> => {
    const user = req.user?.userId;
    const { title, description, priority, status, dueDate } = req.body;
    const userDetail = await User.findById(user);
    if (!userDetail) {
      return res.status(401).json({
        message: null,
        error: "Sorry, no user found",
        data: null,
        status: 401,
      });
    }
    const todoId = req.params.todoId;
    type Role = keyof typeof allowedFieldsByRole; // 'admin' | 'user'

    const role = userDetail.role as Role;

    if (!(role in allowedFieldsByRole)) {
      return res.status(403).json({ error: "Invalid role", status: 403 });
    }

    const allowedFields = allowedFieldsByRole[role];
    const updatedData = filterFields(req.body, allowedFields);
    const todo = await Todos.findById(todoId);
    if (!todo) {
      return res.status(404).json({ error: "Todo not found" });
    }
    if (userDetail?.role !== "admin" && todo.assignedTo !== user) {
      return res.status(403).json({ error: "Access Denied" });
    }
    const updatedTodos = await Todos.findByIdAndUpdate(todoId, updatedData, {
      new: true,
    });
    if (updatedTodos) {
      return res.status(200).json({
        message: "Todos updated",
        data: updateTodos,
        error: null,
        status: 200,
      });
    } else {
      return res.status(200).json({
        message: null,
        data: null,
        error: "Sorry, the todos can not be updated.",
        status: 200,
      });
    }
  }
);

export const addNewTodo = asyncHandler(
  async (
    req: express.Request<{}, {}, TodoBody>,
    res: express.Response
  ): Promise<express.Response> => {
    const { title, description, status, priority, assignedTo, dueDate } =
      req.body;
    const user = req.user?.userId;
    const currentUser = await User.findById(user);
    let assignedUserId: string | undefined = currentUser?._id;
    if (currentUser?.role.includes("admin")) {
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
      return res.status(200).json({
        message: "Todos has been created",
        data: todoCreation,
        status: 200,
        error: null,
      });
    } else {
      return res.status(400).json({
        message: null,
        data: null,
        status: 400,
        error: "Sorry, the todos can not be added",
      });
    }
  }
);

export const allowedFieldsByRoles = {
  admin: ["title", "description", "priority", "status", "duedate"],
  user: ["title", "description"],
};

export const filterFieldsDetails = (data: any, allowedFields: string[]) => {
  let filtered: any = {};
  for (let key of allowedFields) {
    if (data[key] !== undefined) {
      filtered[key] = data[key];
    }
  }
};
export const getTodosByDate = asyncHandler(
  async (
    req: express.Request<{}, {}, { startDate?: string; endDate?: string }>,
    res: express.Response
  ): Promise<express.Response> => {
    const userId = req.user?.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(401).json({
        message: null,
        error: "Unauthorized: User not found",
        status: 401,
        data: null,
      });
    }

    const { startDate, endDate } = req.body;

    if (!startDate || !endDate) {
      return res.status(400).json({
        message: null,
        error: "Both startDate and endDate are required",
        status: 400,
        data: null,
      });
    }

    const dateRangeFilter = {
      dueDate: {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      },
    };

    const roleFilter =
      user.role === "admin"
        ? {}
        : { assignedTo: new mongoose.Types.ObjectId(user._id) };

    const todos = await Todos.find({
      ...roleFilter,
      ...dateRangeFilter,
    })
      .populate("assignedTo", "fullName userName email")
      .populate("assignedBy", "fullName userName email")
      .sort({ dueDate: 1 });

    return res.status(200).json({
      message: "Todos by date",
      data: todos,
      error: null,
      status: 200,
    });
  }
);

export const deleteTodos = asyncHandler(
  async (
    req: express.Request<{ id: string }>,
    res: express.Response
  ): Promise<express.Response> => {
    const { id } = req.params;
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({
        status: 401,
        message: null,
        data: null,
        error: "Unauthorized request.",
      });
    }
    const todo = await Todos.findByIdAndDelete(id);
    if (!todo) {
      return res.status(404).json({
        status: 404,
        message: null,
        data: null,
        error: "No To-Do found for today or not authorized.",
      });
    }

    return res.status(200).json({
      status: 200,
      message: "To-Do deleted successfully!",
      data: null,
      error: null,
    });
  }
);

export const updateTodosStatus = asyncHandler(
  async (
    req: express.Request<{ id: string }>,
    res: express.Response
  ): Promise<express.Response> => {
    const { id } = req.params;

    const updateTodosStatus = await Todos.findByIdAndUpdate(
      id,
      {
        $set: {
          status: "completed",
        },
      },
      {
        new: true,
      }
    );
    if (updateTodosStatus) {
      return res.status(200).json({
        status: 200,
        message: "To-Do marked as completed!",
        data: updateTodosStatus,
        error: null,
      });
    } else {
      return res.status(500).json({
        status: 500,
        message: null,
        data: null,
        error: "Todo can not be updated",
      });
    }
  }
);

export const updateTodosStatusToPending = asyncHandler(
  async (
    req: express.Request<{ id: string }>,
    res: express.Response
  ): Promise<express.Response> => {
    const { id } = req.params;
    const updateTodosStatus = await Todos.findByIdAndUpdate(
      id,
      {
        $set: {
          status: "pending",
        },
      },
      {
        new: true,
      }
    );
    if (updateTodosStatus) {
      return res.status(200).json({
        status: 200,
        message: "To-Do marked as completed!",
        data: updateTodosStatus,
        error: null,
      });
    } else {
      return res.status(500).json({
        status: 500,
        message: null,
        data: null,
        error: "Todo can not be updated",
      });
    }
  }
);

export const sendReminder = asyncHandler(
  async (
    req: express.Request<{ id: string }>,
    res: express.Response
  ): Promise<express.Response> => {
    const { id } = req.params;
    const { reminderTime }: { reminderTime: Date } = req.body;
    if (!id || !reminderTime) {
      return res
        .status(400)
        .json({ error: "Todo ID and Reminder Time are required." });
    }
    const updateReminderOfTodos = await Todos.findByIdAndUpdate(
      id,
      {
        $set: {
          remiderTime: new Date(reminderTime),
        },
      },
      {
        new: true,
      }
    );
    if (updateReminderOfTodos) {
      return res.status(200).json({
        message: "Reminder set successfully.",
        data: updateReminderOfTodos,
        error: null,
        status: 200,
      });
    } else {
      return res.status(500).json({
        error: "Reminder not set.",
        data: null,
        message: null,
        status: 500,
      });
    }
  }
);

const sendReminders = async () => {
  try {
    const now = new Date();
    const reminders = await Todos.aggregate([
      {
        $match: {
          reminderTime: {
            $gte: new Date(now.getTime() - 60000), //Reminder time is greater than or equal to 1 minute ago
            $lt: now, //Reminder time is less than the current time
          }, // Check whether the reminder time is
          status: "pending",
        },
      },
      {
        $lookup: {
          from: "users", // Ensure this matches your MongoDB collection name
          foreignField: "_id",
          localField: "createdFor",
          as: "UserDetails",
        },
      },
      {
        $addFields: {
          userDetails: { $first: "$UserDetails" }, // Get the first user object
        },
      },
    ]);

    for (const todo of reminders) {
      if (todo.userDetails && todo.userDetails.email) {
        await sendEmailReminder(
          todo.userDetails.email,
          "Reminder: Upcoming Todo Task",
          `Hey ${todo.userDetails.fullName}, your task "${todo.title}" is due soon!`
        );
        console.log(`Reminder email sent to ${todo.userDetails.email}`);
      }
    }
  } catch (error) {
    console.error("Error sending reminders:", error);
  }
};

// Schedule job to run every 2 minute
cron.schedule("*/2 * * * *", async () => {
  console.log(" Checking for tasks with reminder times...");
  await sendReminders();
});
