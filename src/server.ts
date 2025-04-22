import { createServer } from "http";
import { connect } from "mongoose";
import { Server } from "socket.io";
import dotenv from "dotenv";

import app from "./app.js";
dotenv.config();

connect(process.env.MONGO_URL as string)
  .then(() => {
    console.log("Connected to DB");
  })
  .catch(console.error);

const server = createServer(app);

const io = new Server(server);

io.on("connection", (socket) => {
  socket.on("message", (data) => {
    console.log("connected", socket.id, data);
  });
});
// setInterval(() => {
//   io.emit("Blah", "POOf");
// }, 3000);

const PORT = Number(process.env.PORT!) || 3000;
server.listen(PORT, "127.0.0.1", () => {
  console.log(`running server on ${PORT}`);
});

process.on("uncaughtException", (err) => {
  console.error(err);
});

process.on("unhandledRejection", (err) => {
  console.error(err);
});
