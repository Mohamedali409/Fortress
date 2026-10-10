import { Router } from "express";
import * as authController from "./auth.controller.js";
import validate from "../../middlewares/validate.middleware.js";
import loginRateLimit from "../../middlewares/login-rate-limit.middleware.js";
import { registerSchema, loginSchema } from "./auth.validation.js";

const router = Router();

router.post("/register", validate(registerSchema), authController.register);
router.post(
  "/login",
  loginRateLimit,
  validate(loginSchema),
  authController.login,
);
router.post("/logout", authController.logout);
export default router;
