import express from "express";
import { Cart, ItemFields } from "../models/cart.model";
import { AddCartBody, asyncHandler } from "../utils/function";
import { Product } from "../models/product.model";
import mongoose from "mongoose";

export const addItemToCart = asyncHandler(
  async (
    req: express.Request<{}, {}, AddCartBody>,
    res: express.Response
  ): Promise<express.Response> => {
    const { productId, quantity } = req.body;
    const user = req.user?.userId;
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        status: 404,
        message: "Product not found.",
        data: null,
        error: null,
      });
    }
    if (product.productQuantity < quantity) {
      return res.status(400).json({ message: "Not enough stock" });
    }
    let cart = await Cart.findOne({ userId: user });
    if (cart) {
      const index = cart.items.findIndex(
        (p) => p.productId.toString() === productId
      );
      if (index > -1) {
        cart.items[index].quantity += quantity;
        cart.items[index].totalPrice += product.productPrice * quantity;
      } else {
        const newItem: ItemFields = {
          productId: new mongoose.Types.ObjectId(productId),
          productName: product.productName,
          quantity: quantity,
          singlePrice: product.productPrice,
          totalPrice: product.productPrice,
        };
        cart.items.push(newItem);
      }
    } else {
      cart = new Cart({
        userId: user,
        items: [
          {
            productId: productId,
            productName: product.productName,
            quantity: quantity,
            singlePrice: product.productPrice,
            totalPrice: product.productPrice,
          },
        ],
      });
    }
    product.productQuantity -= quantity;
    await product.save();
    cart.bill = cart.items.reduce((acc, item) => acc + item.totalPrice, 0);
    await cart.save();
    return res.status(200).json({
      status: 200,
      message: "Item added to cart successfully.",
      data: cart,
      error: null,
    });
  }
);

export const updateItemFromCart = asyncHandler(
  async (
    req: express.Request<{}, {}, AddCartBody>,
    res: express.Response
  ): Promise<express.Response> => {
    const { productId, quantity } = req.body;
    const user = req.user?.userId;
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        status: 404,
        message: "Product not found.",
        data: null,
        error: null,
      });
    }
    if (product.productQuantity < quantity) {
      return res.status(400).json({ message: "Not enough stock" });
    }
    const cart = await Cart.findOne({ userId: user });
    if (!cart) {
      return res.status(404).json({ status: 404, message: "Cart not found" });
    }
    const index = cart.items.findIndex(
      (p) => p.productId.toString() === productId
    );
    if (index === -1) {
      return res
        .status(404)
        .json({ status: 404, message: "Product not in cart" });
    }
    const item = cart.items[index];
    const oldQuantity = item.quantity;
    item.singlePrice = product.productPrice;
    item.totalPrice = product.productPrice * quantity;
    item.quantity = quantity;
    const difference = quantity - oldQuantity;
    product.productQuantity -= difference;
    cart.bill = cart.items.reduce((acc, item) => acc + item.totalPrice, 0);
    await cart.save();
    await product.save();
    return res.status(200).json({
      message: "Cart item updated successfully",
      cart,
    });
  }
);

export const deleteItemFromCart = asyncHandler(
  async (
    req: express.Request,
    res: express.Response
  ): Promise<express.Response> => {
    const { productId }: { productId: string } = req.body;
    const user = req.user?.userId;
    if (!productId) {
      return res.status(400).json({ message: "Missing fields" });
    }
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        status: 404,
        message: "Product not found.",
        data: null,
        error: null,
      });
    }
    const cart = await Cart.findOne({ userId: user });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }
    const initialLength = cart.items.length;
    cart.items = cart.items.filter(
      (item) => item.productId.toString() !== productId
    );
    if (cart.items.length !== initialLength) {
      return res.status(404).json({ message: "Item not f6ound in cart" });
    }
    cart.bill = cart.items.reduce((acc, item) => acc + item.totalPrice, 0);
    await cart.save();
    const index = cart.items.findIndex(
      (p) => p.productId.toString() === productId
    );
    const deletedItem = cart.items[index];
    product.productQuantity += deletedItem.quantity;
    product.save();
    return res.status(200).json({
      message: "Item removed from cart successfully",
      cart,
    });
  }
);
