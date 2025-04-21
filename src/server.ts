import http from "http";
import { connect } from "mongoose";
import io from "socket.io";
import dotenv from "dotenv";

import app from "./app.js";
dotenv.config();

connect(process.env.MONGO_URL as string)
  .then(() => {
    console.log("Connected to DB");
  })
  .catch(console.error);

const PORT = +process.env.PORT! || 3000;
http.createServer(app).listen(PORT, "127.0.0.1", () => {
  console.log(`running server on ${PORT}`);
});
