import type { User, ValidatorHook } from "./controller.js";
import type { IUser } from "../models/model.js";
import Users from "../models/user.model.js";
import ControllerApiFactory from "./ControllerApiFactory.js";
import { userCascader } from "../models/group.model.js";

const userController = new ControllerApiFactory<User, IUser>(Users);

const userValidator = (data: User): ReturnType<ValidatorHook<User>> => {
  if (data?.password !== data?.confirmPassword) {
    return { isValid: false, error: "Passwords do not match" };
  }
  return { isValid: true };
};

const userPreProcessor = (data: User): IUser => {
  const username = data?.username?.trim();
  const email = data?.email?.trim();
  const password = data?.password?.trim();
  return { ...data, username, email, password }; 
};

export const createUser = userController.createDoc(
  ["username", "email", "password", "confirmPassword"],
  userValidator,
  userPreProcessor,
  true
);

export const getUser = userController.getDoc();

export const getAllUsers = userController.getAllDocs(["username", "email"]);

export const updateUser = userController.updateDoc(
  ["username", "password", "email", "avatar"],
  userValidator,
  userPreProcessor
);

export const deleteUser = userController.deleteDoc(userCascader);
