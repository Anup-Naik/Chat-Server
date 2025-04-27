import { Schema, model, Types } from "mongoose";

import CRUD from "./CRUD.js";
import type { CascadeHook, IGroup } from "./model.js";

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
    users: [
      {
        type: Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true, validateBeforeSave: true }
);

const Group = model<IGroup>("Group", groupSchema);

export const userCascader: CascadeHook = async (id: string) => {
  const userId = new Types.ObjectId(id);
  await Group.updateMany(
    { users:  userId  },
    { $pull: { users: userId } }
  );
  await Group.deleteMany({ users: { $size: 0 } });
};

export default new CRUD<IGroup>(Group);
