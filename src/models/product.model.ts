import mongoose, { Document, Schema, Types } from "mongoose";
export interface ProductDocument extends Document {
  _id: string;
  productName: string;
  productDescription: string;
  productQuantity: number;
  productPrice: number;
  productCategory: Types.ObjectId;
  productImages: string[];
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema<ProductDocument>(
  {
    productName: {
      type: String,
      required: true,
    },
    productDescription: {
      type: String,
      required: true,
    },
    productCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    productQuantity: {
      type: Number,
      required: true,
    },
    productPrice: {
      type: Number,
      required: true,
    },
    productImages: [
      {
        type: String,
        required: true,
      },
    ],
    isDeleted: {
      type: Boolean,
    },
  },
  {
    timestamps: true,
  }
);

export const Product = mongoose.model<ProductDocument>(
  "Product",
  productSchema
);
