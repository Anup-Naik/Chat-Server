import { Server, Socket } from "socket.io";
import { authSocketMiddleware } from "./auth.controller.js";

export const setupSocketServer = (io: Server) => {
  io.use(authSocketMiddleware);

  io.on("connection", (socket: Socket) => {
    console.log(`User connected: ${socket.data.user.userId}`);

    const { userId } = socket.data;
    socket.join(`user:${userId}`);

    socket.on("message", (data) => {
      try {
        if (!data || !data.content || !data.recipient) {
          socket.emit("error", { message: "Invalid message format" });
          return;
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
      } catch (error) {
        console.error("Message handling error:", error);
        socket.emit("error", { message: "Failed to process message" });
      }
    });

    socket.on("joinGroup", (groupId) => {
      socket.join(`group:${groupId}`);
      socket.emit("groupJoined", { groupId });
    });

    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.data.userId}`);
    });
  });
};
