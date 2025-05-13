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

export interface RequestWithFile extends express.Request {
  file?: Express.Multer.File;
}
export interface RequestWithFiles extends express.Request {
  files?: Express.Multer.File[];
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
