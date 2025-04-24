import { NextFunction, Request, Response } from "express";
// eslint-disable-next-line @typescript-eslint/no-require-imports
import jwt = require("jsonwebtoken");
import { createUser } from "./user.controller.js";
import { ExpressError } from "../utils/customError.js";
import { ExtendedError, Socket } from "socket.io";

export const createJWT = async (data: object) => {
  const JWT = jwt.sign(data, process.env.JWT_SECRET!, {
    algorithm: "HS256",
    expiresIn: "1h",
  });
  return JWT;
};

export const authHttpMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.headers.authorization) {
    return next(new ExpressError(401, "Not LoggedIn"));
  }

  jwt.verify(
    req.headers.authorization.replace("Bearer", "").trim(),
    process.env.JWT_SECRET!,
    function (err, data) {
      if (err) return next(new ExpressError(401, "Not LoggedIn"));

      res.locals.user = (data as jwt.JwtPayload)?.userId;
      return next();
    }
  );
};

export const authSocketMiddleware = (socket: Socket, next: (err?: ExtendedError | undefined) => void) => {
  const token = socket.handshake.auth?.jwt;
  if (!token) {
    return next(new ExpressError(401, "Not LoggedIn") as ExtendedError);
  }

  jwt.verify(token, process.env.JWT_SECRET!, (err: unknown, data: unknown) => {
    if (err) return next(new ExpressError(401, "Not Authenticated") as ExtendedError);
    socket.data.user = data;
    next();
  });
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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password, ...userData } = user.toObject();
  const token = await createJWT({ userId: userData._id });
  res.status(201).json({ status: "success", data: { token, data: userData } });
};
