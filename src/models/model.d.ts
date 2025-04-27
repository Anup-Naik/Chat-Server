import type { HydratedDocument, Types } from "mongoose";

export interface IUser {
  username: string;
  email: string;
  password: string;
  avatar: string;
}
export type UserDocument = HydratedDocument<IUser>;

export interface IGroup {
  name: string;
  avatar: string;
  users: Types.ObjectId[] | IUser[];
}
export type GroupDocument = HydratedDocument<IGroup>;

export interface Pagination {
  limit: number;
  page: number;
  skip: number;
}

export type Sort<T> = {
  [key in keyof Partial<T>]: 1 | -1;
};

export type CascadeHook = (id: string) => Promise<void>;
