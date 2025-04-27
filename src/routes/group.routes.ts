import { Router } from "express";

import catchAsync from "../utils/catchAsync.js";
import {
  createGroup,
  deleteGroup,
  getAllGroups,
  getGroup,
  updateGroup,
} from "../controllers/group.controller.js";

const router = Router();

router.route("/").post(catchAsync(createGroup)).get(catchAsync(getAllGroups));
router
  .route("/:id")
  .get(catchAsync(getGroup))
  .patch(catchAsync(updateGroup))
  .delete(catchAsync(deleteGroup));

export default router;
