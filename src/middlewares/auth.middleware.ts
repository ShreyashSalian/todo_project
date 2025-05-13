import express from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { User } from "../models/user.model";
import { Login } from "../models/login.model";
import { asyncHandler } from "../utils/function";

export const verifyUser = asyncHandler(
  async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ): Promise<void | express.Response> => {
    try {
      const token: string | undefined =
        req.cookies?.accessToken ||
        req.header("Authorization")?.replace("Bearer", "").trim();

      if (!token) {
        return res.status(401).json({
          status: 401,
          message: null,
          data: null,
          error: "Unauthorized request. No token provided.",
        });
      }
      const secretKey = process.env.ACCESS_TOKEN;
      if (!secretKey) {
        throw new Error("ACCESS_TOKEN environment variable is not set");
      }
      const decodedToken = jwt.verify(token, secretKey) as JwtPayload;

      console.log(decodedToken);
      const userDetails = await Login.findOne({
        token: token,
        email: decodedToken?.email,
        userId: decodedToken?.userId,
      });
      if (!userDetails) {
        return res.status(401).json({
          status: 401,
          message: null,
          data: null,
          error: "Unauthorized request. Invalid token.==========",
        });
      }
      req.user = userDetails;
      next();
    } catch (err: any) {
      console.error("Error verifying token:", err.message);

      if (["TokenExpiredError", "JsonWebTokenError"].includes(err.name)) {
        return res.status(401).json({
          status: 401,
          message: null,
          data: null,
          error: `Unauthorized request. ${err.message}`,
        });
      }

      return res.status(500).json({
        status: 500,
        message: "Internal server error.",
        data: null,
        error: "An error occurred during token verification.",
      });
    }
  }
);

export const AdminUser = asyncHandler(
  async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ): Promise<void | express.Response> => {
    try {
      const user = req.user?.userId;
      if (!user) {
        return res.status(401).json({
          status: 401,
          message: "Unauthorized request. User information is missing.",
          data: null,
          error: null,
        });
      }
      const userDetails = await User.findById(user);
      if (!user) {
        return res.status(401).json({
          status: 401,
          message: "Unauthorized request. User information is missing.",
          data: null,
          error: null,
        });
      }
      if (userDetails?.role === "admin") {
        return next();
      } else {
        return res.status(401).json({
          status: 401,
          message: null,
          data: null,
          error: "Unauthorized request. Sorry you are not allowed to this.",
        });
      }
    } catch (err: any) {
      console.log(err);
    }
  }
);
