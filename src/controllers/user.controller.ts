import { NextFunction, Request, Response } from "express";
import Users from "../models/user.model.js";
import { ExpressError } from "../utils/customError.js";
import { User } from "./controller.js";
import { paginateHandler, sortHandler } from "../utils/queryHandler.js";

export const createUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { username, email, password, confirmPassword, avatar }: User = req.body;

  if (!(username && email && password && confirmPassword)) {
    return next(new ExpressError(400, "Mandatory Fields Required"));
  }
  if (password !== confirmPassword) {
    return next(new ExpressError(400, "Passwords do not match"));
  }

  const newUser = await Users.createOne({
    username: username.trim(),
    email: email.trim(),
    password: password.trim(),
    avatar,
  });
  res.status(201).json({ status: "success", data: { data: newUser } });
};

export const getUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;
  if (!id) {
    return next(new ExpressError(400, "Invalid Id"));
  }
  const user = await Users.readOne(id);
  res.status(200).json({ status: "success", data: { data: user } });
};

export const getAllUsers = async (
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
) => {
  const page = paginateHandler(req.query);
  const sort = sortHandler<User>(req.query,['username','email']);
  const users = await Users.readAll(page, sort);
  res.status(200).json({ status: "success", data: { data: users } });
};

export const updateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { username, password, email, avatar }: User = req.body;
  let user: Partial<User> | [string, string][] = {
    username,
    password,
    email,
    avatar,
  };
  user = Object.entries(user).filter(([key, value]) => {
    return value && ["username", "password", "email", "avatar"].includes(key);
  });
  user = Object.fromEntries(user);
  
  const { id } = req.params;
  if (!id) {
    return next(new ExpressError(400, "Invalid Id"));
  }
  const updatedUser = await Users.updateOne(id, user);
  res.status(200).json({ status: "success", data: { data: updatedUser } });
};

export const deleteUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;
  if (!id) {
    return next(new ExpressError(400, "Invalid Id"));
  }
  await Users.deleteOne(id);
  res.status(204).json({ status: "success", data: {} });
};
