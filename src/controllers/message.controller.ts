import { Query } from "express-serve-static-core";
import Messages from "../models/message.model.js";
import Users from "../models/user.model.js";
import Groups from "../models/group.model.js";
import type { IMessage } from "../models/model.js";
import type { Message } from "./controller.js";
import ControllerApiFactory from "./ControllerApiFactory.js";

const messageController = new ControllerApiFactory<Message, IMessage>(Messages);

//Creation of Messages Only in Sockets
export const createMessage = async (
  data: Partial<Message>,
  user: string,
  saveToDB: boolean
): Promise<Message> => {
  if (!data || !data.content || !data.recipient) {
    throw new Error("Invalid message format");
  }
  if (data.type === "Group") {
    const group = await Groups.readOne(data.recipient as string);
    if (!group) throw new Error("Group does not Exist");
  } else {
    const user = await Users.readOne(data.recipient as string);
    if (!user) throw new Error("User does not Exist");
  }

  const newMessage: Message = {
    content: data.content,
    recipient: data.recipient,
    type: data.type || "User",
    sender: user,
    createdAt: new Date(),
  };
  if (saveToDB) {
    const newDoc = await Messages.createOne(newMessage as IMessage);
    if (!newDoc) throw new Error("Failed Saving Message to DataBase");
  }
  return newMessage;
};

//Http Handlers

const messageFilter = (query: Query) => {
  const q = query.filter;
  if (!q || typeof q === "string" || q instanceof Array) return {};
  const sender = q.sender;
  const recipient = q.recipient;
  if (sender && recipient) return { sender, recipient };
  else if (sender) return { sender };
  else if (recipient) return { recipient };
  return {};
};
const messagePopulater = (query: Query) => {
  const p = query.populate;
  if (!p || typeof p === "string" || p instanceof Array) return [];
  if (p.sender && p.recipient)
    return [
      { path: "sender", select: "" },
      { path: "recipient", select: "" },
    ];
  return [];
};
export const getMessages = messageController.getAllDocs(
  messageFilter,
  ["createdAt"],
  messagePopulater
);

export const getMessage = messageController.getDoc(messagePopulater);

export const deleteMessage = messageController.deleteDoc();
