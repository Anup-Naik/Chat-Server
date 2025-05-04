import { Schema, model, Types } from "mongoose";

import CRUD from "./CRUD.js";
import type { IMessage } from "./model.js";

const messageSchema = new Schema<IMessage>({
  content: { type: String, required: true },
  sender: { type: Types.ObjectId, ref: "User" },
  recipient: { type: Types.ObjectId, ref: "User" },
  type: { type: String, enum: ["User", "Group"] },
  createdAt: { type: Date, default: Date.now, expires: 86400000 },
});

messageSchema.index({ sender: 1, recipient: 1, createdAt: -1 });
messageSchema.index({ recipient: 1, type: 1, createdAt: -1 });

const Message = model<IMessage>("Message", messageSchema);

export default new CRUD(Message);
