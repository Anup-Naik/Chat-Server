import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    unique: true,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  joinedAt: {
    type: Date,
    default: Date.now(),
  },
  status: {
    type: String,
    enum: ["active", "deleted"],
  },
});

const User = mongoose.model("User", userSchema);
