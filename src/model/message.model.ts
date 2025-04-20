import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  message: {
    type: String,
    requires: true,
  },
  user: {
    type: mongoose.Types.ObjectId,
    ref: "User",
    required: true,
  },
  chat: {
    type: mongoose.Types.ObjectId,
    ref: "Chat",
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

const Message = mongoose.model('Message',messageSchema);

