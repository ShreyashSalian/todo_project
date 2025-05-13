import { Types } from "mongoose";
export interface UserDetails {
  email: string;
  userId: Types.ObjectId;
  token: string;
}

import * as express from "express-serve-static-core";

declare global {
  namespace Express {
    interface Request {
      user?: UserDetails;
    }
  }
}
