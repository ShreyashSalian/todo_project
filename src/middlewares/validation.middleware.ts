import { validationResult } from "express-validator";
import express from "express";
export const validateApi = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
): void | Promise<void> => {
  const errors = validationResult(req);

  if (errors.isEmpty()) {
    return next();
  }
  const extractedError: { [key: string]: string } = {};
  errors
    .array({ onlyFirstError: true })
    .map((err: any) => (extractedError[err.path] = err.msg));

  const responsePayload = {
    status: 417,
    message: null,
    data: null,
    error: extractedError,
  };

  res.status(417).json(responsePayload); // Explicitly return void here
  return;
};
