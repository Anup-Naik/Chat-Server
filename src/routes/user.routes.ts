import { Router } from "express";
import { createUser, getUser } from "../controllers/user.controller.js";
import catchAsync from "../utils/catchAsync.js";

const router = Router();

router.post("/", catchAsync(createUser));
router.route("/:id").get(catchAsync(getUser));

export default router;
