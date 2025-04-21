import { HydratedDocument, Types } from "mongoose";

export interface IUser {
  username: string;
  email: string;
  password: string;
  avatar: string;
  joinedAt?: Date;
  status?: "active" | "deleted";
}
export type UserDocument = HydratedDocument<IUser>;

export interface IMessage {
  message: string;
  user: Types.ObjectId | IUser;
  chat: Types.ObjectId | IChat;
  createdAt?: Date;
}
export type MessageDocument = HydratedDocument<IMessage>;

export interface IChat {
  name: string;
  messages: Types.ObjectId[] | IMessage[];
  users: Types.ObjectId[] | IUser[];
}
export type ChatDocument = HydratedDocument<IChat>;
