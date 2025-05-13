import express from "express";
import { verifyUser } from "../middlewares/auth.middleware";
import { validateApi } from "../middlewares/validation.middleware";
import { loginValidation } from "../validations/login.validation";
import { LoginUser, logout } from "../controllers/auth.controller";

const authRoutes = express.Router();
authRoutes.post("/login", loginValidation(), validateApi, LoginUser);
authRoutes.get("/logout", verifyUser, logout);

export default authRoutes;
