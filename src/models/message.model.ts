import { Schema, model, Types } from "mongoose";
import { IMessage } from "./types.model.js";
import CRUD from "./crud.js";

const messageSchema = new Schema<IMessage>({
  message: {
    type: String,
    required: true,
  },
  user: {
    type: Types.ObjectId,
    ref: "User",
    required: true,
  },
  chat: {
    type: Types.ObjectId,
    ref: "Chat",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Message = model<IMessage>("Message", messageSchema);

export default new CRUD<IMessage>(Message);
