import { Schema, model, Types } from "mongoose";

import CRUD from "./crud.js";
import type { CascadeHook, IGroup } from "./model.js";
import { User } from "./user.model.js";
import { Message } from "./message.model.js";

const groupSchema = new Schema<IGroup>(
  {
    name: {
      type: String,
      unique: true,
      required: true,
      minlength: 5,
      maxlength: 10,
    },
    avatar: {
      type: String,
    },
    admin: { type: Types.ObjectId, ref: "User" },
    users: [
      {
        type: Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true, validateBeforeSave: true }
);

groupSchema.path("users").index(true);

const Group = model<IGroup>("Group", groupSchema);

export const userCascader: CascadeHook = async (id: string) => {
  const userId = new Types.ObjectId(id);
  await User.updateMany(
    { "contacts.contact": userId },
    { $pull: { contacts: { contact: userId } } }
  );
  await Message.deleteMany({
    $or: [{ sender: userId }, { recipient: userId }],
  });
  await Group.updateMany({ users: userId }, { $pull: { users: userId } });
  await Group.deleteMany({ users: { $size: 0 } });
};

export default new CRUD<IGroup>(Group);
