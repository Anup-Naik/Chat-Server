import { Router } from "express";
import {
  createGroup,
  deleteGroup,
  getAllGroups,
  getGroup,
  updateGroup,
} from "../controllers/group.controller.js";
import catchAsync from "../utils/catchAsync.js";

const router = Router();

router.route("/").post(catchAsync(createGroup)).get(catchAsync(getAllGroups));
router
  .route("/:id")
  .get(catchAsync(getGroup))
  .patch(catchAsync(updateGroup))
  .delete(catchAsync(deleteGroup));

export default router;
