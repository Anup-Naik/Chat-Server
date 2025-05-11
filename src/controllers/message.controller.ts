import Messages from "../models/message.model.js";
import type { IMessage } from "../models/model.js";
import type { Message } from "./controller.js";
import ControllerApiFactory from "./ControllerApiFactory.js";

const messageController = new ControllerApiFactory<Message,IMessage>(Messages);

//Creation of Messages Only in Sockets
export const createMessage = async (
  data: Partial<Message>,
  user: string,
  saveToDB: boolean
): Promise<Message> => {
  if (!data || !data.content || !data.recipient) {
    throw new Error("Invalid message format");
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

// const messageFilterBuilder = ()=>{}

// export const getMessages = messageController.getAllDocs()