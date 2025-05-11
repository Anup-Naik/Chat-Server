import type { HydratedDocument, Types } from "mongoose";

export interface IUser {
  username: string;
  email: string;
  password: string;
  avatar: string;
  contacts?: Contact[];
}
export interface Contact {
  contact: IUser | IGroup | Types.ObjectId;
  type: "User" | "Group";
}
export type UserDocument = HydratedDocument<IUser>;

export interface IGroup {
  name: string;
  admin: IUser | Types.ObjectId;
  avatar: string;
  users: Types.ObjectId[] | IUser[];
}
export type GroupDocument = HydratedDocument<IGroup>;

export interface IMessage {
  content: string;
  sender: Types.ObjectId | IUser;
  recipient: Types.ObjectId | IUser | IGroup;
  type: "User" | "Group";
  createdAt: Date;
}
export type MessageDocument = HydratedDocument<IMessage>;

export interface Pagination {
  limit: number;
  page: number;
  skip: number;
}

export type Populate = {
  path: string;
  select: string;
}[];

export type Sort<T> = {
  [key in keyof Partial<T>]: 1 | -1;
};

export type CascadeHook = (id: string) => Promise<void>;
