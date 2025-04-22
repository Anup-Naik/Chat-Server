import { NextFunction, Request, Response } from "express";
import { Types } from "mongoose";
import Users from "../models/user.model.js";
import { ExpressError } from "../utils/customError.js";

export const createUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { username, email, password,confirmPassword, avatar } = req.body;

  if (!(username && email && password &&confirmPassword)) {
    return next(new ExpressError(400, "Mandatory Fields Required"));
  }
  if (password !==confirmPassword) {
    return next(new ExpressError(400, "Passwords do not match"));
  }


  const newUser = await Users.createOne({
    username,
    email,
    password,
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
  const User = await Users.readOne(new Types.ObjectId(id));
  if (!User) {
    return next(new ExpressError(404, "User does not exist"));
  }
  res.status(200).json({ status: "success", data: { data: User } });
};

export const getAllUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const users = await Users.readAll();
  if (!users) {
    return next(new ExpressError(404, "No Users Found"));
  }
  res.status(200).json({ status: "success", data: { data: users } });
};

export const updateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { username, password, email, avatar } = req.body;
  let user = { username, password, email, avatar };
  user = Object.entries(user).filter(([key, value]: [string, string]) => {
    return value && ["username", "password", "email", "avatar"].includes(key);
  });
  const { id } = req.params;
  const updatedUser = await Users.updateOne(
    new Types.ObjectId(id),
    Object.fromEntries(user)
  );
  res.status(200).json({ status: "success", data: { data: updatedUser } });
};

export const deleteUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;

  await Users.deleteOne(new Types.ObjectId(id));
  res.status(204).json({ status: "success", data: {} });
};
