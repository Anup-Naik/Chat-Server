import { NextFunction, Request, Response } from "express";
// eslint-disable-next-line @typescript-eslint/no-require-imports
import jwt = require("jsonwebtoken");
import { createUser } from "./user.controller.js";
import { ExpressError } from "../utils/customError.js";

export const signup = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = await createUser(req, res, next);
  if (!user) {
    next(new ExpressError(400, "SignUp Failed"));
  }
  jwt.sign(
    { id: user?._id },
    process.env.JWT_SECRET!,
    { algorithm: "RS256", expiresIn: 5000 },
    (err, token) => {
      if(err) next(new ExpressError(400,"SignUp Failed"))
      res.status(201).json({ status: "success", data: { token, data: user } });
    }
  );
};
