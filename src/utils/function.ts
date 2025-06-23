import express from "express";
import fs from "fs";

export function asyncHandler<
  P = {},
  ResBody = any,
  ReqBody = any,
  ReqQuery = any
>(
  fn: (
    req: express.Request<P, ResBody, ReqBody, ReqQuery>,
    res: express.Response<ResBody>,
    next: express.NextFunction
  ) => Promise<any>
) {
  return (
    req: express.Request<P, ResBody, ReqBody, ReqQuery>,
    res: express.Response<ResBody>,
    next: express.NextFunction
  ) => Promise.resolve(fn(req, res, next)).catch(next);
}

export const trimInput = (value: string) => {
  if (typeof value === "string") {
    return value.trim();
  }
  return value;
};

export const deleteFile = (file: Express.Multer.File | undefined) => {
  if (file) {
    fs.unlinkSync(file.path);
  }
};

// Allowed file types and maximum size
export const allowedMimeTypes = ["image/jpeg", "image/png"];
export const maxSize = 2 * 1024 * 1024; // 2MB

export interface AddCartBody {
  productId: string;
  quantity: number;
}

export const sendSuccess = (
  res: express.Response,
  statusCode: number,
  message: string,
  data: any
) => {
  return res.status(statusCode).json({
    status: statusCode,
    message,
    data,
    error: null,
  });
};

export const sendError = (
  res: express.Response,
  statusCode: number,
  error: string
) => {
  return res.status(statusCode).json({
    status: statusCode,
    message: null,
    data: null,
    error,
  });
};

const convertToUpperCase = (name: string) => {
  const char = name.split(" ");
  for (let i = 0; i < char.length; i++) {
    char[i] = char[i].charAt(0).toUpperCase() + char[i].slice(1);
  }
  return char.join(" ");
};

export const allowedFieldsByRole = {
  admin: ["title", "description", "priority", "status", "duedate"],
  user: ["title", "description"],
};

export const filterFields = (data: any, allowedFields: string[]) => {
  const filtered: any = {};
  for (const key of allowedFields) {
    if (data[key] !== undefined) {
      filtered[key] = data[key];
    }
    return filtered;
  }
};

export const allowedFieldsList = {
  admin: ["title", "description", "priority", "status", "duedate"],
  user: ["title", "description"],
};

export const filterFieldData = (data: any, allowedFields: string[]) => {
  let filtered: any = {};
  for (const key of allowedFields) {
    if (data[key] !== undefined) {
      filtered[key] = data[key];
    }
    return filtered;
  }
};

export interface RequestWithFile extends Request {
  file?: Express.Multer.File; // Multer's file object for a single file
}

export interface CustomRequestWithFiles extends express.Request {
  files?: Express.Multer.File[]; // Adjusted to handle multiple files
}
