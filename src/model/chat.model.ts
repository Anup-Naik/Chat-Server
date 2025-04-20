import mongoose from "mongoose";

const chatSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  messages: [
    {
      type: mongoose.Types.ObjectId,
      ref: "Message",
    },
  ],
  users: [
    {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
  ],
});

const Chat = mongoose.model("Chat", chatSchema);
