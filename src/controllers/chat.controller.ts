import { Server, Socket } from "socket.io";
import { authSocketMiddleware } from "./auth.controller.js";
import { errorHandler } from "../utils/socketErrorHandler.js";
const publicKeyMap = new Map();
export const setupSocketServer = (io: Server) => {
  io.use(authSocketMiddleware);

  io.on("connection", (socket: Socket) => {
    const { userId } = socket.data;
    socket.join(`user:${userId}`);

    console.log(`User connected: ${userId}`);

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

    socket.on(
      "message:encryptedSend",
      errorHandler(
        (data) => {
          if (!data || !data.encryptedContent || !data.recipient) {
            socket.emit("error", { message: "Invalid message format" });
            return;
          }

          const enrichedMessage = {
            ...data,
            sender: userId,
            timestamp: new Date(),
          };

          io.to(`user:${data.recipient}`).emit("message", enrichedMessage);
          socket.emit("message:sent", {
            status: true,
          });
        },
        socket,
        "Failed to process message"
      )
    );

    socket.on(
      "message",
      errorHandler(
        (data) => {
          if (!data || !data.content || !data.recipient) {
            throw new Error("Invalid message format");
          }
          const enrichedMessage = {
            ...data,
            sender: userId,
            timestamp: new Date(),
          };

          if (data.recipientType === "group") {
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

    socket.onAny((...args) => {
      console.error("Invalid Event. Data Recieved" + args.join(", "));
      socket.emit("error", { message: "Invalid Event" });
    });
  });
};
