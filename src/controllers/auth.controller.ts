import { NextFunction, Request, Response } from "express";
import { ExtendedError, Socket } from "socket.io";
// eslint-disable-next-line @typescript-eslint/no-require-imports
import jwt = require("jsonwebtoken");

import * as Config from "../server.config.js";
import { ExpressError } from "../utils/customError.js";
import { checkPassword, createUser } from "./user.controller.js";

export const createJWT = async (data: object) => {
  const JWT = jwt.sign(data, Config.auth.jwtSecret, {
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
    Config.auth.jwtSecret,
    function (err, data) {
      if (err) return next(new ExpressError(401, "Not LoggedIn"));

      res.locals.user = (data as jwt.JwtPayload)?.userId;
      return next();
    }
  );
};

export const authSocketMiddleware = (
  socket: Socket,
  next: (err?: ExtendedError | undefined) => void
) => {
  let token: string = (socket.request.headers.jwt as string)
    .replace("Bearer", "")
    .trim();

  token = token || socket.handshake.auth?.jwt;

  if (!token) {
    return next(new ExpressError(401, "Not LoggedIn") as ExtendedError);
  }

  jwt.verify(token, Config.auth.jwtSecret, (err, data) => {
    if (err || !data || typeof data !== "object" || !data.userId)
      return next(new ExpressError(401, "Not Authenticated") as ExtendedError);
    socket.data.userId = data.userId;
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

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new ExpressError(400, "Email and Password Required"));
  }
  const user = await checkPassword(email, password);
  const token = await createJWT({ userId: user._id });
  res.status(200).json({ status: "success", data: { token, data: user } });
};
