import { HydratedDocument, Types } from "mongoose";

export interface IUser {
  username: string;
  email: string;
  password: string;
  avatar: string;
}
export type UserDocument = HydratedDocument<IUser>;

export interface IChat {
  name: string;
  users: Types.ObjectId[] | IUser[];
}
export type ChatDocument = HydratedDocument<IChat>;
