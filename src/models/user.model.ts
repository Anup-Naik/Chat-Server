import { Schema, Types, type UpdateQuery, model } from "mongoose";
import bcrypt from "bcryptjs";

import CRUD from "./crud.js";
import Groups from "./group.model.js";
import type { Contact, IUser } from "./model.js";
import { ExpressError } from "../utils/customError.js";

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
    contacts: [
      {
        contact: {
          type: Types.ObjectId,
          refPath: "type",
        },
        type: { type: String, enum: ["User", "Group"], required: true },
      },
    ],
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

export const confirmPassword = async (email: string, password: string) => {
  const user = await User.findOne(
    { email },
    { password: 1, username: 1, avatar: 1, email: 1, createdAt: 1 }
  );
  if (!user) {
    throw new ExpressError(404, "User Not Found");
  }
  const isValid = await bcrypt.compare(password, user.password);
  if (isValid) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userData } = user.toObject({ useProjection: true });
    return userData;
  }
  throw new ExpressError(400, "Invalid Email or Password");
};

export const addContact = async (id: string, contact: Contact) => {
  const exists = await User.findOne({
    _id: id,
    "contacts.contact": contact.contact,
  });
  if (exists) throw new ExpressError(400, "Contact already exist");

  if (contact.type === "Group") {
    const group = await Groups.readFilteredOne({ _id: contact.contact });
    if (!group) throw new ExpressError(404, "Group Contact does not exist");
    else {
      const user = await User.updateOne(
        { _id: id },
        { $addToSet: { contacts: contact } }
      );
      return user;
    }
  } else if (contact.type === "User") {
    const user = await User.findById(contact.contact);
    if (!user) throw new ExpressError(404, "User Contact does not exist");
    else {
      const user = await User.updateOne(
        { _id: id },
        { $addToSet: { contacts: contact } }
      );
      return user;
    }
  }
};

export const removeContact = async (id: string, contactId: Types.ObjectId) => {
  const user = await User.findByIdAndUpdate(
    id,
    {
      $pull: { contacts: { contact: contactId } },
    },
    { new: true }
  );
  return user;
};

export default new CRUD<IUser>(User);
