import express from "express";
import { verifyUser } from "../middlewares/auth.middleware";
import {
  addItemToCart,
  deleteItemFromCart,
  updateItemFromCart,
} from "../controllers/cart.controller";

const cartRoute = express.Router();
cartRoute.post("/", verifyUser, addItemToCart);
cartRoute.put("/", verifyUser, updateItemFromCart);
cartRoute.delete("/", verifyUser, deleteItemFromCart);

export default cartRoute;
