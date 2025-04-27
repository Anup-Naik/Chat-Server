import cors from "cors";
import helmet from "helmet";
import ExpressMongoSanitize from "express-mongo-sanitize";
import express, { NextFunction, Request, Response } from "express";

import authRouter from "./routes/auth.routes.js";
import userRouter from "./routes/user.routes.js";
import groupRouter from "./routes/group.routes.js";

import { customError, ExpressError } from "./utils/customError.js";
import { authHttpMiddleware } from "./controllers/auth.controller.js";
import * as Config from "./server.config.js";

const app = express();

app.use(helmet());
app.use(
  cors({
    origin(requestOrigin, callback) {
      if (!requestOrigin || Config.cors.whitelist.includes(requestOrigin)) {
        callback(null, true);
      } else {
        callback(new ExpressError(403, "Not allowed by CORS"));
      }
    },
  })
);
app.use(ExpressMongoSanitize({ allowDots: true }));

app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

app.options("*forAll", cors());
app.use("/api/v1/", authRouter);
app.use("/api/v1/users/", authHttpMiddleware, userRouter);
app.use("/api/v1/groups/", authHttpMiddleware, groupRouter);

app.all("*catchAll", (req, res, next) => {
  next(new ExpressError(404, "Not Found"));
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: unknown, req: Request, res: Response, next: NextFunction) => {
  const error = customError(err);
  res.status(error.statusCode).json({
    status: "error",
    data: {
      message: error.message,
    },
  });
});

export default app;
