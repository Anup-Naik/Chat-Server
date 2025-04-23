import { Schema, model, Types } from "mongoose";
import { IGroup } from "./model.js";
import CRUD from "./CRUD.js";

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
  { timestamps: true,validateBeforeSave:true }
);

const Group = model<IGroup>("Group", groupSchema);
export default new CRUD<IGroup>(Group);
