import { checkSchema, Meta } from "express-validator";
import fs from "fs";

import { trimInput } from "../utils/function";

export const productValidator = () => {
  return checkSchema({
    productName: {
      notEmpty: {
        errorMessage: "Please enter the product name.",
      },
    },
    productDescription: {
      notEmpty: {
        errorMessage: "Please enter the product description.",
      },
    },
    productQuantity: {
      notEmpty: {
        errorMessage: "Please enter the product quantity",
      },
    },
    productImages: {
      custom: {
        options: (value: any, { req }: { req: any }) => {
          if (!Array.isArray(req.files) || req.files.length === 0) {
            throw new Error("Please upload at least one product image.");
          }

          const allowedMimeTypes = ["image/jpeg", "image/png"];
          (req.files as Express.Multer.File[]).forEach((file) => {
            if (!allowedMimeTypes.includes(file.mimetype)) {
              (req.files as Express.Multer.File[]).forEach((f) =>
                fs.unlinkSync(f.path)
              );
              throw new Error("Only .jpeg and .png formats are allowed.");
            }
            if (file.size > 3 * 1024 * 1024) {
              (req.files as Express.Multer.File[]).forEach((f) =>
                fs.unlinkSync(f.path)
              );
              throw new Error("Image size should not exceed 3MB.");
            }
          });
          return true;
        },
      },
    },
    productPrice: {
      notEmpty: {
        errorMessage: "Please enter the product price",
      },
      isNumeric: {
        errorMessage: "Default price must be a valid number.",
      },
      optional: true, // Correctly set to 'true' as per OptionalOptions
    },
    productCategory: {
      notEmpty: {
        errorMessage: "Please select the product category.",
      },
    },
  });
};
