import { Types } from "mongoose";
import type { IGroup } from "../models/model.js";
import type { Group, PermissionHook, ValidatorHook } from "./controller.js";
import ControllerApiFactory from "./ControllerApiFactory.js";
import Groups from "../models/group.model.js";
import Users from "../models/user.model.js";
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
  if (!data.avatar) {
    return {
      isValid: false,
      error: "Avatar Required",
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
  const avatar = data.avatar.trim();
  return { avatar, name, users, admin: users[0] };
};

export const createGroup = groupController.createDoc(
  ["name", "users", "avatar"],
  groupValidator,
  groupPreProcessor
);

const groupPopulater = (query: Query) => {
  const p = query.populate;
  if (!p || typeof p === "string" || p instanceof Array) return [];
  if (p.users) return [{ path: "users", select: "" }];
  return [];
};
export const getGroup = groupController.getDoc(groupPopulater);

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

export const getAllGroups = groupController.getAllDocs(groupFilter, [
  "name",
  "users",
]);

const updateGroupValidator = (
  data: Group
): ReturnType<ValidatorHook<Group>> => {
  if (!data.name && !data.avatar) {
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
  const name = data.name?.trim();
  const avatar = data.avatar?.trim();
  return { avatar, name };
};
export const updateGroup = groupController.updateDoc(
  ["name", "avatar"],
  updateGroupValidator,
  updateGroupPreProcessor
);

export const deleteGroup = groupController.deleteDoc();

export const isGroupAdmin: PermissionHook = async (groupId, userId) => {
  const group = await Groups.readFilteredOne({
    _id: new Types.ObjectId(groupId),
    admin: new Types.ObjectId(userId),
  });
  if (group.admin) return true;
  return false;
};

const memberValidator = async (users: string[]) => {
  const userIds = users.map((user) => {
    new Types.ObjectId(user);
  });
  const userDocs = await Users.readAll({ _id: { $in: userIds } });
  if (!(userDocs.length === userIds.length)) {
    return { isValid: false, error: "user/s not valid" };
  }
  return { isValid: true };
};
export const addGroupMembers = groupController.addRefDoc<string[]>(
  "users",
  memberValidator
);
export const removeGroupMembers = groupController.removeRefDoc("users");
