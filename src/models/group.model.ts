import { Schema, model, Types } from "mongoose";
import { IGroup } from "./model.js";
import CRUD from "./CRUD.js";

const groupSchema = new Schema<IGroup>(
  {
    name: {
      type: String,
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
  { timestamps: true }
);

const Group = model<IGroup>("Group", groupSchema);
export default new CRUD<IGroup>(Group);
