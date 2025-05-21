import type { IUser } from "../models/model.js";
import type { Query } from "express-serve-static-core";
import type {
  AsyncValidatorHook,
  Contact,
  User,
  ValidatorHook,
} from "./controller.js";

import Users, {
  addContact,
  confirmPassword,
  removeContact,
} from "../models/user.model.js";
import ControllerApiFactory from "./ControllerApiFactory.js";
import { userCascader } from "../models/group.model.js";
import { NextFunction, Request, Response } from "express";
import { ExpressError } from "../utils/customError.js";
import { Types } from "mongoose";

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

const userUpdateValidator = async (
  data: User
): ReturnType<AsyncValidatorHook<User>> => {
  if (data.password) {
    if (
      !data.email ||
      !data.password ||
      !data.confirmPassword ||
      !data.oldPassword
    )
      return {
        isValid: false,
        error: "email, password, confirmPassword and oldPassword Required",
      };
    if (data.password !== data.confirmPassword)
      return { isValid: false, error: "Passwords do not match" };
    const user = await confirmPassword(data.email, data.oldPassword);
    if (user) return { isValid: true };
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
  ["username", "password", "confirmPassword", "oldPassword", "email", "avatar"],
  userUpdateValidator,
  userPreProcessor
);

export const deleteUser = userController.deleteDoc(userCascader);

export const checkPassword = confirmPassword;

export const addContactHttp = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const id = res.locals.userId;
  if (!id) {
    return next(new ExpressError(400, "Invalid Id"));
  }
  const contact: Contact = req.body.contact;
  if (
    !contact ||
    !contact.contact ||
    !contact.type ||
    !Types.ObjectId.isValid(contact.contact as string)
  ) {
    return next(new ExpressError(400, "Valid Contact required"));
  }
  const newContact = {
    ...contact,
    contact: new Types.ObjectId(contact.contact as string),
  };
  await addContact(id, newContact);
  res
    .status(200)
    .json({ status: "success", data: { message: "Contact Added" } });
};

export const removeContactHttp = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const id = res.locals.userId;
  if (!id) {
    return next(new ExpressError(400, "Invalid Id"));
  }
  const { contactId } = req.body;
  if (!contactId || !Types.ObjectId.isValid(contactId)) {
    return next(new ExpressError(400, "Valid ContactId required"));
  }

  const user = await removeContact(id, contactId);
  res.status(204).json({ status: "success", data: user });
};
