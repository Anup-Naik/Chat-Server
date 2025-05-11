import { Server, Socket } from "socket.io";
import { authSocketMiddleware } from "./auth.controller.js";
import { errorHandler } from "../utils/socketErrorHandler.js";
import { Message } from "./controller.js";
import { createMessage } from "./message.controller.js";
const publicKeyMap = new Map();
export const setupSocketServer = (io: Server) => {
  //Auth
  io.use(authSocketMiddleware);

  //User Connection
  io.on("connection", (socket: Socket) => {
    const { userId } = socket.data;
    socket.join(`user:${userId}`);

    console.log(`User connected: ${userId}`);
    
    //Getting User Public Key for e-to-e encryption
    socket.emit("publickey:request");
    socket.on(
      "publickey:response",
      errorHandler(
        (publickey) => {
          if (
            publickey &&
            typeof publickey === "string" &&
            publickey.length > 5
          ) {
            publicKeyMap.set(userId, publickey);
          } else throw new Error("Invalid PublicKey");
        },
        socket,
        "Error Processing Your Key"
      )
    );

     //Request for Recipient Public Key
    socket.on(
      "publickey:recipientkey",
      errorHandler(
        (recipient) => {
          const recipientkey = publicKeyMap.get(recipient);
          if (!recipientkey) {
            throw new Error("Recipient is Not Online.");
          }
          socket.emit("publickey:recipientkey", recipientkey);
        },
        socket,
        "Error Fetching PublicKey"
      )
    );

    //Private Messaging
    socket.on(
      "message:encryptedSend",
      errorHandler(
        async (data) => {
          const { content, recipient } = data;
          const enrichedMessage: Message = await createMessage(
            { content, recipient },
            userId,
            false
          );

          io.to(`user:${data.recipient}`).emit("message", enrichedMessage);
          socket.emit("message:sent", {
            status: true,
          });
        },
        socket,
        "Failed to process message"
      )
    );

     //normalMessage
    socket.on(
      "message",
      errorHandler(
        async (data) => {
          if (
            !data ||
            !data.content ||
            !data.recipient ||
            !data.recipientType
          ) {
            throw new Error("Invalid message format");
          }
          const { content, recipient, recipientType } = data;
          const enrichedMessage: Message = await createMessage(
            { content, recipient, type: recipientType },
            userId,
            true
          );

          if (recipientType === "group") {
            io.to(`group:${data.recipient}`).emit("message", enrichedMessage);
          } else {
            io.to(`user:${data.recipient}`).emit("message", enrichedMessage);
            socket.emit("message:sent", {
              status: true,
            });
          }
        },
        socket,
        "Failed to process message"
      )
    );

    socket.on("joinGroup", (groupId) => {
      socket.join(`group:${groupId}`);
      socket.emit("groupJoined", { groupId });
    });

    socket.on("disconnect", () => {
      publicKeyMap.delete(userId);
      console.log(`User disconnected: ${userId}`);
    });
  });
};
