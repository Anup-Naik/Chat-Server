import { NextFunction, Request, Response } from "express";
import type { User, ValidatorHook } from "./controller.js";
import Users from "../models/user.model.js";
import { ExpressError } from "../utils/customError.js";
import { paginateHandler, sortHandler } from "../utils/queryHandler.js";
import ControllerApiFactory from "./ControllerApiFactory.js";
import { IUser } from "../models/model.js";

const userController = new ControllerApiFactory<User, IUser>(Users);

const userValidator = (data: User): ReturnType<ValidatorHook<User>> => {
  if (data.password !== data.confirmPassword) {
    return { isValid: false, error: "Passwords do not match" };
  }
  return { isValid: true };
};

const userPreProcessor = (data: User): IUser => {
  const username = data.username.trim();
  const email = data.email.trim();
  const password = data.password.trim();
  return { ...data, username, email, password };
};
export const createUser = userController.createDoc(
  ["username", "email", "password", "confirmPassword"],
  userValidator,
  userPreProcessor
);

export const getUser = userController.getDoc();

export const getAllUsers = userController.getAllDocs(["username", "email"])
 
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
