import { Schema, model, Types } from "mongoose";
import { IChat } from "./model.types.js";
import CRUD from "./CRUD.js";

const chatSchema = new Schema<IChat>(
  {
    name: {
      type: String,
    },
    users: [
      {
        type: Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

const Chat = model<IChat>("Chat", chatSchema);
export default new CRUD<IChat>(Chat);
