import { Types } from "mongoose";
import type { IGroup } from "../models/model.js";
import type { Group, ValidatorHook } from "./controller.js";
import ControllerApiFactory from "./ControllerApiFactory.js";
import Groups from "../models/group.model.js";
import { Query } from "express-serve-static-core";

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
  return { ...data, name, users, admin: users[0] };
};


const updateGroupValidator = (data: Group): ReturnType<ValidatorHook<Group>> => {
  if(!data.name && !data.avatar){
    return { isValid: false, error: "Provide Update Fields" };
  }
  if (!(5 <= data.name.length && data.name.length <= 10)) {
    return {
      isValid: false,
      error: "GroupName Must be 5-10 Characters Long",
    };
  }
  return { isValid: true };
};

const updateGroupPreProcessor = (data: Group): Partial<IGroup> => {
  const name = data.name.trim();
  const avatar = data.avatar.trim();
  return { avatar, name };
};

export const createGroup = groupController.createDoc(
  ["name", "users"],
  groupValidator,
  groupPreProcessor
);

export const getGroup = groupController.getDoc("users");

const groupFilter = (query: Query) => {
  const q = query.filter;
  if (!q || typeof q === "string" || q instanceof Array) {
    return {};
  }
  if (q.userId && typeof q.userId === "string") {
    return { users: q.userId };
  }
  return {};
};

export const getAllGroups = groupController.getAllDocs(
  groupFilter,
  ["name", "users"],
  "users"
);

export const updateGroup = groupController.updateDoc(
  ["name", "avatar"],
  updateGroupValidator,
  updateGroupPreProcessor
);

export const deleteGroup = groupController.deleteDoc();
