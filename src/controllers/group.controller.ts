import { NextFunction, Request, Response } from "express";
import Groups from "../models/group.model.js";
import { Group } from "./controller.js";
import { ExpressError } from "../utils/customError.js";
import { Types } from "mongoose";

export const createGroup = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { name, avatar, users }: Group = req.body;

  if (!(name && users.length)) {
    return next(new ExpressError(400, "Name and Initial User Required"));
  }
  const groupUsers = users.map((val) => new Types.ObjectId(val as string));
  const newGroup = await Groups.createOne({
    name: name.trim(),
    users: groupUsers,
    avatar,
  });
  res.status(201).json({ status: "success", data: { data: newGroup } });
};

export const getGroup = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;
  if (!id) {
    return next(new ExpressError(400, "Invalid GroupId"));
  }
  const group = await Groups.readOne(id);
  res.status(200).json({ status: "success", data: { data: group } });
};

//IMPLEMENT GET-ALL USER GROUPS IN CRUD GENERIC
export const getAllGroups = async (
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
) => {
  const groups = await Groups.readAll();
  res.status(200).json({ status: "success", data: { data: groups } });
};

//IMPLEMENT ADD/REMOVE USER METHOD/S in GENERIC CRUD
export const updateGroup = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { name, avatar }: Group = req.body;
  if (!name) {
    return next(new ExpressError(400, "Enter new GroupName"));
  }
  const { id } = req.params;
  if (!id) {
    return next(new ExpressError(400, "Invalid Id"));
  }
  const updatedGroup = await Groups.updateOne(id, {name,avatar});
  res.status(200).json({ status: "success", data: { data: updatedGroup } });
};

export const deleteGroup = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;
  if (!id) {
    return next(new ExpressError(400, "Invalid GroupId"));
  }
  await Groups.deleteOne(id);
  res.status(204).json({ status: "success", data: {} });
};
