import asyncHandler from "../../utils/asyncHandler.js";
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
  const { user, token } = await userService.login(req.body);

  res.cookie("access_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 15 * 60 * 1000,
  });

  res.status(201).json({
    success: true,
    message: "login successful",
    data: {
      user,
    },
  });
});

export { register, login };
