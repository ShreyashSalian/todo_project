import mongoose from "mongoose";
import { addAdmin } from "../utils/addAdmin";

const connectDB = async (): Promise<void> => {
  try {
    // const DB = `${process.env.DOCKER_PATH}/${process.env.DATABASE_NAME}`;
    const DB =
      process.env.NODE_ENV === "development"
        ? `${process.env.LOCAL_PATH}/${process.env.DATABASE_NAME}`
        : `${process.env.lIVE_PATH}/${process.env.DATABASE_NAME}`;

    const connect = await mongoose.connect(DB);
    addAdmin();
    console.log(`The Database connected to : ${connect.connection.host}`);
  } catch (err: any) {
    console.log(`Error while connecting to Database`, err);
    process.exit(1);
  }
};

export default connectDB;
