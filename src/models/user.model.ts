import { Schema, UpdateQuery, model } from "mongoose";
import { IUser } from "./model.js";
import CRUD from "./CRUD.js";
import bcrypt from "bcryptjs";

const userSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      unique: true,
      required: true,
      minlength: 5,
      maxlength: 10,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      validate: {
        validator: function (val) {
          return /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(val);
        },
        message: "Enter a valid email",
      },
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    avatar: {
      type: String,
    },
  },
  { timestamps: true, validateBeforeSave: true }
);

userSchema.pre("save", function (next) {
  if (this.isModified("password")) {
    bcrypt.hash(this.password, 10, (err, hash) => {
      if (hash) {
        this.password = hash;
      }
      next();
    });
  } else {
    next();
  }
});

userSchema.pre("findOneAndUpdate", function (next) {
  const update = this.getUpdate() as UpdateQuery<unknown>;
  if (!update) return next();
  const updateObj = update.$set || update;
  if (updateObj.password) {
    bcrypt.hash(updateObj.password, 10, (err, hash) => {
      if (hash) {
        if (update.$set) {
          update.$set.password = hash;
        } else {
          update.password = hash;
        }
      }
      next();
    });
  } else {
    next();
  }
});

export const User = model<IUser>("User", userSchema);
export default new CRUD<IUser>(User);
