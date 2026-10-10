import asyncHandler from "../../utils/asyncHandler.js";
import { cookieName, cookieOptions } from "../../config/auth-cookie.js";
import * as userService from "./auth.service.js";

const register = asyncHandler(async (req, res) => {
  const user = await userService.register(req.body);

  res.status(201).json({
    success: true,
    message: "Account cretaed successfully",
    data: {
      user,
    },
  });
});

const login = asyncHandler(async (req, res) => {
  const { user, token, expiresAt } = await userService.login(req.body);

  res.cookie(cookieName, token, {
    ...cookieOptions,
    maxAge: Math.max(0, expiresAt - Date.now()),
  });

  res.status(201).json({
    success: true,
    message: "login successful",
    data: {
      user,
    },
  });
});

const logout = asyncHandler(async (req, res) => {
  res.clearCookie(cookieName, cookieOptions);

  res.status(200).json({
    success: true,
    message: "logout successful",
  });
});

export { register, login, logout };
