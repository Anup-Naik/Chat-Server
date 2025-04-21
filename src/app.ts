import express, { NextFunction, Request, Response } from "express";
import Messages from "./model/message.model.js";
import Users from "./model/user.model.js";

const app = express();

app.use(express.json());

app.post(
  "/api/v1/users",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { username, email, password, avatar } = req.body;
      let newUser;
      if (username && email && password && avatar) {
        newUser = await Users.createOne({
          username,
          email,
          password,
          avatar,
        });
      }
      res.status(200).json({ status: "success", data: { data: newUser } });
    } catch (err: unknown) {
      console.error(err);
      next(err);
    }
  }
);

app.use((err: unknown, req: Request, res: Response, next: NextFunction) => {
  res.status(500).json({
    status: "error",
    data: {
      message: err,
    },
  });
});

export default app;
