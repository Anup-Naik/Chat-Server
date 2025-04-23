import express, { NextFunction, Request, Response } from "express";
import userRouter from "./routes/user.routes.js";
import groupRouter from "./routes/group.routes.js";
import { customError, ExpressError } from "./utils/customError.js";
import helmet from "helmet";
// import ExpressMongoSanitize from "express-mongo-sanitize";

const app = express();

app.use(express.json());
app.use(helmet());
// app.use(ExpressMongoSanitize({ dryRun: true }));

app.use("/api/v1/users/", userRouter);
app.use("/api/v1/groups/", groupRouter);

app.all("*catchAll", (req, res, next) => {
  next(new ExpressError(404, "Not Found"));
});
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: unknown, req: Request, res: Response, next: NextFunction) => {
  const error = customError(err);
  res.status(error?.statusCode || 500).json({
    status: "error",
    data: {
      message: error.message,
    },
  });
});

export default app;
