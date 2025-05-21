import { Router } from "express";

import catchAsync from "../utils/catchAsync.js";
import {
  addGroupMembers,
  createGroup,
  deleteGroup,
  getAllGroups,
  getGroup,
  removeGroupMembers,
  updateGroup,
} from "../controllers/group.controller.js";
import { groupAuthorization } from "../controllers/auth.controller.js";

const router = Router();

router.route("/").post(catchAsync(createGroup)).get(catchAsync(getAllGroups));
router
  .route("/:id")
  .get(catchAsync(getGroup))
  .patch(catchAsync(groupAuthorization), catchAsync(updateGroup))
  .delete(catchAsync(groupAuthorization), catchAsync(deleteGroup));

router
  .route("/:id/users")
  .post(catchAsync(groupAuthorization), catchAsync(addGroupMembers))
  .delete(catchAsync(groupAuthorization), catchAsync(removeGroupMembers));
export default router;
