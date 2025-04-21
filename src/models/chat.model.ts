import { Schema, model, Types } from "mongoose";
import { IChat } from "./types.model.js";
import CRUD from "./CRUD.js";

const chatSchema = new Schema<IChat>({
  name: {
    type: String,
  },
  messages: [
    {
      type: Types.ObjectId,
      ref: "Message",
    },
  ],
  users: [
    {
      type: Types.ObjectId,
      ref: "User",
    },
  ],
});

const Chat = model<IChat>("Chat", chatSchema);
export default new CRUD<IChat>(Chat);
