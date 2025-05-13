import express from "express";
import { User } from "../models/user.model";
import { Login } from "../models/login.model";
import { asyncHandler } from "../utils/function";
import { LoginBody } from "../helpers/auth.helpers";

const generateAccessAndRefreshToken = async (
  userId: string
): Promise<{
  accessToken: string;
  refreshToken: string;
}> => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error("No user found");
  }
  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();
  return { accessToken, refreshToken };
};

export const LoginUser = asyncHandler(
  async (
    req: express.Request<{}, {}, LoginBody>,
    res: express.Response,
    next: express.NextFunction
  ): Promise<express.Response> => {
    const { userNameOrEmail, password } = req.body;
    const checkUserExist = await User.findOne({
      $or: [
        {
          email: { $regex: userNameOrEmail, $options: "i" },
        },
        {
          userName: userNameOrEmail,
        },
      ],
    });
    if (!checkUserExist) {
      return res.status(404).json({
        status: 404,
        message: null,
        data: null,
        error: "No user found with the given email or username.",
      });
    }
    if (!checkUserExist.isEmailVerified) {
      return res.status(404).json({
        status: 404,
        message: null,
        data: null,
        error:
          "Please check your email and click on link to verify your account.",
      });
    }
    const passwordCheck = await checkUserExist.comparePassword(password);
    if (!passwordCheck) {
      return res.status(401).json({
        status: 401,
        message: null,
        data: null,
        error: "Please enter valid password.",
      });
    }
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
      checkUserExist?._id
    );
    await Login.create({
      userId: checkUserExist?._id,
      email: checkUserExist?.email,
      refreshToken: refreshToken,
      token: accessToken,
    });
    const loginUser = await User.findById(checkUserExist?._id).select(
      "-password"
    );
    return res.status(200).json({
      mesaage: "User login successfully.",
      error: null,
      data: { accessToken, refreshToken, loginUser },
      status: 200,
    });
  }
);

export const logout = asyncHandler(
  async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ): Promise<express.Response> => {
    const user = req.user?.userId;
    if (!user) {
      const responsePayload = {
        status: 401,
        message: null,
        data: null,
        error: "Invalid or missing user_id in request",
      };
    }
    const userDetail = await Login.findOneAndDelete({ userId: user });
    if (userDetail) {
      const responsePayload = {
        status: 200,
        message: null,
        data: null,
        error: "User cannot logout.",
      };
      return res.status(200).json(responsePayload);
    } else {
      return res.status(200).json({
        message: "User log out successfully.",
        data: null,
        error: null,
        status: 200,
      });
    }
  }
);
