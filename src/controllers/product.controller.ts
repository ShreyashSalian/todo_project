import express from "express";
import { asyncHandler, RequestWithFiles } from "../utils/function";
import { Product } from "../models/product.model";

export const addNewProduct = asyncHandler(
  async (
    req: express.Request,
    res: express.Response
  ): Promise<express.Response> => {
    const customReq = req as RequestWithFiles;
    const {
      productName,
      productDescription,
      productQuantity,
      productPrice,
      productCategory,
    }: {
      productName: string;
      productDescription: string;
      productQuantity: number;
      productPrice: number;
      productCategory: string;
    } = customReq.body;
    const productImages: string[] | null =
      customReq.files && Array.isArray(customReq.files)
        ? customReq.files.map((file) => file.filename)
        : null;

    const productCreation = await Product.create({
      productName,
      productDescription,
      productQuantity,
      productPrice,
      productCategory,
      productImages: productImages,
    });
    if (productCreation) {
      return res.status(200).json({
        status: 200,
        message: "Product added successfully.",
        data: productCreation,
        error: null,
      });
    } else {
      return res.status(500).json({
        status: 500,
        message: "Sorry, the product cannot be added.",
        data: null,
        error: "Product creation failed.",
      });
    }
  }
);
