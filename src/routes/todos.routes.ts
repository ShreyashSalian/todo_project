import express from "express";

import { todosValidation } from "../validations/todo.validation";
import { verifyUser } from "../middlewares/auth.middleware";
import { createTodo, getAllTodos } from "../controllers/todo.controller";
import { validateApi } from "../middlewares/validation.middleware";

const todosRoute = express.Router();
todosRoute.post("/", verifyUser, todosValidation(), validateApi, createTodo);
todosRoute.get("/", verifyUser, getAllTodos);

export default todosRoute;
