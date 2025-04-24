import { Router } from "express";
import { signup } from "../controllers/auth.controller.js";
import catchAsync from "../utils/catchAsync.js";

const router = Router();

router.post("/signup", catchAsync(signup));


export default router;