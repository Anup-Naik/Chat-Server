import { createServer } from "http";
import { connect } from "mongoose";
import { Server } from "socket.io";
import dotenv from "dotenv";

dotenv.config();

const requiredEnvVars = ["MONGO_URL", "JWT_SECRET", "PORT"];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`Missing required environment variable: ${envVar}`);
    process.exit(1);
  }
}

connect(process.env.MONGO_URL as string)
.then(() => {
  console.log("Connected to DB");
})
.catch(console.error);

import app from "./app.js";
import { setupSocketServer } from "./controllers/chat.controller.js";
const server = createServer(app);

const io = new Server(server);
setupSocketServer(io);
const PORT = Number(process.env.PORT!) || 3000;
server.listen(PORT, "127.0.0.1", () => {
  console.log(`running server on ${PORT}`);
});

process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION:", err);
  server.close(() => {
    io.close();
    process.exit(1);
  });
});

process.on("unhandledRejection", (err) => {
  console.error("UNHANDLED REJECTION:", err);
  server.close(() => {
    io.close();
    process.exit(1);
  });
});
