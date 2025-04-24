import { NextFunction, Request, Response } from "express";
// eslint-disable-next-line @typescript-eslint/no-require-imports
import jwt = require("jsonwebtoken");
import { createUser } from "./user.controller.js";
import { ExpressError } from "../utils/customError.js";

export const createJWT = async (data: object) => {
  const JWT = jwt.sign(data, process.env.JWT_SECRET!, {
    algorithm: "HS256",
    expiresIn: 1000 * 60 * 60,
  });
  return JWT;
};

export const signup = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = await createUser(req, res, next);
  if (!user) {
    return next(new ExpressError(400, "SignUp Failed"));
  }
  const data: Partial<typeof user> = user.toObject();
  data["password"] = undefined;
  const token = await createJWT({ id: data.id });
  res.status(201).json({ status: "success", data: { token, data } });
};
