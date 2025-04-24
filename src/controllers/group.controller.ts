import { Types } from "mongoose";
import type { IGroup } from "../models/model.js";
import type { Group, ValidatorHook } from "./controller.js";
import ControllerApiFactory from "./ControllerApiFactory.js";
import Groups from "../models/group.model.js";

const groupController = new ControllerApiFactory<Group, IGroup>(Groups);

const groupValidator = (data: Group): ReturnType<ValidatorHook<Group>> => {
  if (!data.name) {
    return { isValid: false, error: "Enter GroupName" };
  }
  if (!(5 <= data.name.length && data.name.length <= 10)) {
    return {
      isValid: false,
      error: "GroupName Must be 5-10 Characters Long",
    };
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

export const getGroup = groupController.getDoc('users');

export const getAllGroups = groupController.getAllDocs(
  ["name", "users"],
  "users"
);

export const updateGroup = groupController.updateDoc(
  ["name", "avatar"],
  groupValidator,
  groupPreProcessor
);

export const deleteGroup = groupController.deleteDoc();
