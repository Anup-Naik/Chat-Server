import express, { NextFunction, Request, Response } from "express";
import userRouter from './routes/user.routes.js'

const app = express();

app.use(express.json());

app.use('/api/v1/users/', userRouter);

app.use((err: unknown, req: Request, res: Response, next: NextFunction) => {
  res.status(500).json({
    status: "error",
    data: {
      message: err,
    },
  });
});

export default app;
