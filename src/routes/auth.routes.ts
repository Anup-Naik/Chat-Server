import { Router } from "express";
import { login, signup } from "../controllers/auth.controller.js";
import catchAsync from "../utils/catchAsync.js";

const router = Router();

router.post("/signup", catchAsync(signup));
router.get("/login", catchAsync(login));

export default router;
