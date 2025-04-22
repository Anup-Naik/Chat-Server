import { Schema, model } from "mongoose";
import { IUser, UserDocument } from "./model.types.js";
import CRUD from "./CRUD.js";
import bcrypt from "bcryptjs";

const userSchema = new Schema<IUser>({
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
  joinedAt: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ["active", "deleted"],
    select: false,
  },
});

userSchema.pre("save", function (this: UserDocument, next) {
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

userSchema.pre("findOneAndUpdate", function (this, next) {
  const update = this.getUpdate();
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

const User = model<IUser>("User", userSchema);

export default new CRUD<IUser>(User);
