import { Query } from "express-serve-static-core";
import { RootFilterQuery } from "mongoose";
import { Populate } from "../models/model.js";

export interface User {
  username: string;
  email: string;
  password: string;
  confirmPassword?: string;
  avatar: string;
  contacts: Contact[];
}

export interface Contact {
  contact: User | Group | string;
  type: "User" | "Group";
}

export interface Group {
  name: string;
  avatar: string;
  admin: string;
  users: Array<User> | string[];
}

export interface Message {
  content: string;
  sender: string | User;
  recipient: string | User | Group;
  type: "User" | "Group";
  createdAt: Date;
}

export type ValidatorHook<T> = (data: T) => {
  isValid: boolean;
  error?: string;
};

export type AsyncValidatorHook<T> = (data: T) => Promise<{
  isValid: boolean;
  error?: string;
}>;

export type PreProcessorHook<T, U> = (data: T) => U;

export type FilterBuilderHook<T> = (data: Query) => RootFilterQuery<T>;

export type PopulateBuilderHook = (query: Query) => Populate;

export type PermissionHook = (
  docId: string,
  userId: string
) => Promise<boolean>;
