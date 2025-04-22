import express, { NextFunction, Request, Response } from "express";
import userRouter from "./routes/user.routes.js";
import { customError } from "./utils/customError.js";

const app = express();

app.use(express.json());

app.use("/api/v1/users/", userRouter);

app.use((err: unknown, req: Request, res: Response, next: NextFunction) => {
  const error = customError(err);
  console.error(err); 
  res.status(error?.statusCode || 500).json({
    status: "error",
    data: {
      message: error.message,
    },
  });
});

export default app;
