import { Router } from "express";
import { protect } from "../../middlewares/auth.middleware.js";
import * as userController from "./user.controller.js";

const router = Router();

router.get("/me", protect, userController.getMe);

export default router;
