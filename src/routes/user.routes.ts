import { Router } from "express";
import {
  deleteUser,
  getAllUsers,
  getUser,
  updateUser,
} from "../controllers/user.controller.js";
import catchAsync from "../utils/catchAsync.js";

const router = Router();

router.route("/").get(catchAsync(getAllUsers));
router
  .route("/:id")
  .get(catchAsync(getUser))
  .patch(catchAsync(updateUser))
  .delete(catchAsync(deleteUser));

export default router;
