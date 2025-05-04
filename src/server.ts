import { createServer } from "node:http";

import { connect } from "mongoose";
import { Server } from "socket.io";

import app from "./app.js";
import { ExpressError } from "./utils/customError.js";
import * as Config from "./server.config.js";
import { setupSocketServer } from "./controllers/chat.controller.js";


Config.validateEnv();

connect(Config.db.mongoUrl)
  .then(() => {
    console.log("Connected to DB");
  })
  .catch(console.error);

const server = createServer(app);

const io = new Server(server, {
  connectionStateRecovery: {},
  cors: {
    origin(requestOrigin, callback) {
      if (!requestOrigin || Config.cors.whitelist.includes(requestOrigin)) {
        callback(null, true);
      } else {
        callback(new ExpressError(403, "Not allowed by CORS"));
      }
    },
  },
});
setupSocketServer(io);

server.listen(Config.server.port, Config.server.host, () => {
  console.log(
    `Server running on http://127.0.0.1:${Config.server.port}`
  );
});

process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully");
  server.close(() => {
    io.close();
    process.exit(0);
  });
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
