import { Router } from "express";

import catchAsync from "../utils/catchAsync.js";
import {
  addContactHttp,
  deleteUser,
  getAllUsers,
  getUser,
  removeContactHttp,
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
router
  .route("/:id/contacts")
  .post(userAuthorization, catchAsync(addContactHttp))
  .delete(userAuthorization, catchAsync(removeContactHttp));
export default router;
