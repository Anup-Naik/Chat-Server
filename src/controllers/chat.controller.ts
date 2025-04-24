import {  Server, Socket } from "socket.io";
import { authSocketMiddleware } from "./auth.controller.js";

// This function should be called from server.js after creating the Socket.IO server
export const setupSocketServer = (io: Server) => {
  // Apply auth middleware at the connection level
  io.use(authSocketMiddleware);

  io.on("connection", (socket: Socket) => {
    console.log(`User connected: ${socket.data.user.userId}`);
    
    // Join a room based on user ID for private messages
    const userId = socket.data.user.userId;
    socket.join(`user:${userId}`);
    
    // Handle incoming messages
    socket.on("message", (data) => {
      try {
        // Validate message data
        if (!data || !data.content || !data.recipient) {
          socket.emit("error", { message: "Invalid message format" });
          return;
        }
        
        // Add sender info to the message
        const enrichedMessage = {
          ...data,
          sender: userId,
          timestamp: new Date()
        };
        
        // Determine if this is a group or direct message
        if (data.recipientType === "group") {
          // Emit to the specific group room
          io.to(`group:${data.recipient}`).emit("message", enrichedMessage);
        } else {
          // Direct message - send to recipient and sender
          io.to(`user:${data.recipient}`).emit("message", enrichedMessage);
          // Also send to sender if they're not the recipient
          if (data.recipient !== userId) {
            socket.emit("message", enrichedMessage);
          }
        }
      } catch (error) {
        console.error("Message handling error:", error);
        socket.emit("error", { message: "Failed to process message" });
      }
    });
    
    // Handle user joining a group
    socket.on("joinGroup", (groupId) => {
      socket.join(`group:${groupId}`);
      socket.emit("groupJoined", { groupId });
    });
    
    // Handle disconnection
    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.data.user.userId}`);
    });
  });}