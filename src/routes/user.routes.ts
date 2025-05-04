import { Router } from "express";

import catchAsync from "../utils/catchAsync.js";
import {
  deleteUser,
  getAllUsers,
  getUser,
  updateUser,
} from "../controllers/user.controller.js";
import { userAuthorization } from "../controllers/auth.controller.js";

const router = Router();

router.route("/").get(catchAsync(getAllUsers));
router
  .route("/:id")
  .get(userAuthorization, catchAsync(getUser))
  .patch(userAuthorization, catchAsync(updateUser))
  .delete(userAuthorization, catchAsync(deleteUser));

export default router;
