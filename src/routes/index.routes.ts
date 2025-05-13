import express from "express";
import authRoutes from "./auth.routes";
import userRoutes from "./user.routes";
import todosRoute from "./todos.routes";
import commentRoutes from "./comment.routes";
import categoryRoute from "./category.routes";
import productRoute from "./product.routes";
import cartRoute from "./cart.routes";

const indexRoutes = express.Router();
indexRoutes.use("/api/v1/auth", authRoutes);
indexRoutes.use("/api/v1/users", userRoutes);
indexRoutes.use("/api/v1/todos", todosRoute);
indexRoutes.use("/api/v1/comments", commentRoutes);
indexRoutes.use("/api/v1/category", categoryRoute);
indexRoutes.use("/api/v1/product", productRoute);
indexRoutes.use("/api/v1/carts", cartRoute);
indexRoutes.get(
  "/api/v1",
  (req: express.Request, res: express.Response, next: express.NextFunction) => {
    res.status(200).json({ message: "The server is running properly." });
  }
);

export default indexRoutes;
