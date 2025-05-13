import express from "express";
import { User } from "../models/user.model";
import { asyncHandler, RequestWithFile } from "../utils/function";

export const addNewUser = asyncHandler(
  async (
    req: express.Request,
    res: express.Response
  ): Promise<express.Response> => {
    const customReq = req as RequestWithFile;
    const {
      email,
      userName,
      password,
      contactNumber,
      fullName,
    }: {
      email: string;
      userName: string;
      password: string;
      contactNumber: string;
      fullName: string;
    } = customReq.body;

    const checkUserExists = await User.findOne({
      $or: [
        {
          userName: userName,
        },
        {
          email: email,
        },
      ],
    });
    if (checkUserExists) {
      return res.status(409).json({
        status: 409,
        message: null,
        data: null,
        error: "User already exists with the given email or contact number",
      });
    }
    const profileImage = customReq?.file?.filename || "";
    const userCreation = await User.create({
      fullName,
      email,
      password,
      contactNumber,
      userName,
      role: "user",
      profileImage: profileImage,
      isEmailVerified: true,
    });
    const createdUser = await User.findById(userCreation?._id).select(
      "-password"
    );
    if (!createdUser) {
      return res.status(500).json({
        status: 500,
        message: null,
        data: null,
        error: "User creation failed.",
      });
    }
    return res.status(201).json({
      status: 201,
      message: "User created successfully.",
      data: createdUser,
      error: null,
    });
  }
);
export const updateUserDetails = asyncHandler(
  async (req: express.Request, res: express.Response) => {
    const { contactNumber, fullName } = req.body;
    const user = req.user?.userId;
    const updateDetail = await User.findByIdAndUpdate(
      user,
      {
        $set: {
          fullName,
          contactNumber,
        },
      },
      {
        new: true,
      }
    ).select("-password -refreshToken");
    if (!updateDetail) {
      return res.status(500).json({
        status: 500,
        message: null,
        data: null,
        error: "Sorry, User details can not be updated.",
      });
    } else {
      return res.status(200).json({
        status: 200,
        message: "The user details has been updated.",
        data: updateDetail,
        error: null,
      });
    }
  }
);

export const getUserDetails = asyncHandler(
  async (
    req: express.Request,
    res: express.Response
  ): Promise<express.Response> => {
    const user = req.user?.userId;
    if (!user) {
      return res.status(400).json({
        status: 400,
        error: "User not found",
        message: null,
        data: null,
      });
    }
    const userDetails = await User.findById(user).select("-password");
    if (!userDetails) {
      return res.status(400).json({
        status: 400,
        error: "User not found",
        message: null,
        data: null,
      });
    } else {
      return res.status(200).json({
        status: 200,
        error: null,
        message: "The user details",
        data: userDetails,
      });
    }
  }
);
