import { Request, Response } from "express";
import Users from "../models/user.model.js";

export const createUser = async (req: Request, res: Response, next: NextFunction) => {
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
};
