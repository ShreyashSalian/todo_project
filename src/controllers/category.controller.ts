import express from "express";
import { asyncHandler, RequestWithFile } from "../utils/function";
import { Category } from "../models/category.model";

export const addNewCategory = asyncHandler(
  async (
    req: express.Request,
    res: express.Response
  ): Promise<express.Response> => {
    const customReq = req as RequestWithFile;
    console.log(customReq.body);
    const {
      categoryName,
      categoryDescription,
      categorySlug,
      keywords,
      status,
      isFeatured,
    }: {
      categoryName: string;
      categoryDescription: string;
      categorySlug: string;
      keywords: string[];
      status: string;
      isFeatured: boolean;
    } = customReq.body;
    const categoryImage = customReq.file?.filename || "";
    const categoryCreation = await Category.create({
      categoryName,
      categoryDescription,
      categorySlug,
      keywords,
      status,
      categoryImage,
      isFeatured,
    });
    if (!categoryCreation) {
      return res.status(500).json({
        status: 500,
        message: null,
        data: null,
        error: "Sorry, the category can not e created.",
      });
    } else {
      return res.status(201).json({
        status: 201,
        message: "User created successfully.",
        data: categoryCreation,
        error: null,
      });
    }
  }
);
