import express from "express";
import dotnev from "dotenv";
import cookieParser from "cookie-parser";
import path from "path";
import cors from "cors";
import connectDB from "./database/connect";
import rateLimit from "express-rate-limit";
import xssClean from "xss-clean";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
import indexRoutes from "./routes/index.routes";
import { swaggersDocuments } from "./utils/swagger";
import swaggerUI from "swagger-ui-express";
dotnev.config();

const port: string | number = process.env.PORT || 4000;
const app = express();

app.use(
  cors({
    origin: process.env.ORIGIN,
    methods: "GET,POST,PUT,DELETE,PATCH,HEAD",
    credentials: true,
  })
);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(path.resolve(), "public")));
app.use("/images", express.static("public/images"));
app.use(cookieParser());

app.set("view engine", "hbs");
app.set("views", "./src/views");
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 100,
});
app.use(limiter);
app.use(helmet());
app.use(xssClean());
app.use(mongoSanitize());
// Hide Express fingerprint
app.disable("x-powered-by");

connectDB()
  .then(() => {
    app.listen(port, () => {
      console.log(`The server is running at: http://localhost:${port}`);
    });
  })
  .catch((err: any) => {
    console.log(`Error while connecting to database : ${err}`);
  });

app.use(indexRoutes);
app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggersDocuments));
