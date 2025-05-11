import { Router } from "express";

import catchAsync from "../utils/catchAsync.js";
import {
  deleteMessage,
  getMessage,
  getMessages,
} from "../controllers/message.controller.js";

const router = Router();

router.route("/").get(catchAsync(getMessages));
router
  .route("/:id")
  .get(catchAsync(getMessage))
  .delete(catchAsync(deleteMessage));

export default router;
