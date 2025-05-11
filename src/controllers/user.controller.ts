import type { IUser } from "../models/model.js";
import type { Query } from "express-serve-static-core";
import type { User, ValidatorHook } from "./controller.js";

import Users, { confirmPassword } from "../models/user.model.js";
import ControllerApiFactory from "./ControllerApiFactory.js";
import { userCascader } from "../models/group.model.js";

const userController = new ControllerApiFactory<User, IUser>(Users);

const userValidator = (data: User): ReturnType<ValidatorHook<User>> => {
  if (data.password !== data.confirmPassword) {
    return { isValid: false, error: "Passwords do not match" };
  }
  return { isValid: true };
};

const userPreProcessor = (userData: User): IUser => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { confirmPassword, ...data } = userData;
  const username = data?.username?.trim();
  const email = data?.email?.trim();
  const password = data?.password?.trim();
  return { ...data, username, email, password } as IUser;
};

const userUpdateValidator = (data: User): ReturnType<ValidatorHook<User>> => {
  if (
    data.password &&
    data.confirmPassword &&
    data.password !== data.confirmPassword
  ) {
    return { isValid: false, error: "Passwords do not match" };
  }
  return { isValid: true };
};

export const createUser = userController.createDoc(
  ["username", "email", "password", "confirmPassword"],
  userValidator,
  userPreProcessor,
  true
);

const userPopulater = (query: Query) => {
  const p = query.populate;
  if (!p || typeof p === "string" || p instanceof Array) return [];
  if (p.contacts) return [{ path: "contacts", select: "" }];
  return [];
};
export const getUser = userController.getDoc(userPopulater);

const userFilter = (query: Query) => {
  const q = query.filter;
  if (!q || typeof q === "string" || q instanceof Array) return {};

  if (q.username && typeof q.username === "string")
    return { username: q.username };

  if (q.email && typeof q.email === "string") return { email: q.email };

  return {};
};

export const getAllUsers = userController.getAllDocs(userFilter, [
  "username",
  "email",
]);

export const updateUser = userController.updateDoc(
  ["username", "password", "email", "avatar"],
  userUpdateValidator,
  userPreProcessor
);

export const deleteUser = userController.deleteDoc(userCascader);

export const checkPassword = confirmPassword;
