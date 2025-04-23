import { NextFunction, Request, Response } from "express";
import Groups from "../models/group.model.js";
import { Group, ValidatorHook } from "./controller.js";
import { ExpressError } from "../utils/customError.js";
import { Types } from "mongoose";
import { paginateHandler, sortHandler } from "../utils/queryHandler.js";
import ControllerApiFactory from "./ControllerApiFactory.js";
import { IGroup } from "../models/model.js";

const groupController = new ControllerApiFactory<Group, IGroup>(Groups);

const groupValidator = (data: Group): ReturnType<ValidatorHook<Group>> => {
  if(5 <= data.name.length && data.name.length <=10 ){
    return { isValid: false, error: "Length of GroupName Must be 5-10 Characters" };
  }
  if (!data.users.length) {
    return { isValid: false, error: "Group Must have a Creator" };
  }
  return { isValid: true };
};
const groupPreProcessor = (data: Group): IGroup => {
  const users = data.users.map((val) => new Types.ObjectId(val as string));
  const name = data.name.trim();
  return { ...data, name, users };
};

export const createGroup = groupController.createDoc(
  ["name", "users"],
  groupValidator,
  groupPreProcessor
);



export const getGroup = groupController.getDoc();


export const getAllGroups = groupController.getAllDocs(["name", "users"],"users")


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
  const updatedGroup = await Groups.updateOne(id, { name, avatar });
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
