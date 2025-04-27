import { Router } from "express";

import catchAsync from "../utils/catchAsync.js";
import { login, signup } from "../controllers/auth.controller.js";

const router = Router();

router.post("/signup", catchAsync(signup));
router.post("/login", catchAsync(login));

export default router;
