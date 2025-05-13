import mongoose, { Document, Types, Schema, mongo } from "mongoose";

export interface ItemFields {
  productId: Types.ObjectId;
  productName: string;
  quantity: number;
  singlePrice: number;
  totalPrice: number;
}
export interface ItemDocument extends ItemFields, Document {}

export interface CartDocument extends Document {
  _id: string;
  userId: Types.ObjectId;
  items: ItemFields[];
  bill: number;
}

const itemSchema = new Schema<ItemDocument>(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    productName: {
      type: String,
    },
    quantity: {
      type: Number,
      required: true,
    },
    singlePrice: {
      type: Number,
      required: true,
    },
    totalPrice: {
      type: Number,
    },
  },
  {
    timestamps: true,
  }
);

const cartSchema = new Schema<CartDocument>({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  items: [itemSchema],
  bill: Number,
});

export const Cart = mongoose.model("Cart", cartSchema);
export const Item = mongoose.model("Item", itemSchema);
