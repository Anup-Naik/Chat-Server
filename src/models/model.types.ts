import { HydratedDocument, Types } from "mongoose";

export interface IUser {
  username: string;
  email: string;
  password: string;
  avatar: string;
}
export type UserDocument = HydratedDocument<IUser>;

export interface IGroup {
  name: string;
  avatar:string;
  users: Types.ObjectId[] | IUser[];
}
export type ChatDocument = HydratedDocument<IGroup>;
