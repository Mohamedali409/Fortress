import asyncHandler from "../../utils/asyncHandler.js";
import * as userService from "./user.service.js";

const getMe = asyncHandler(async (req, res) => {
  const user = await userService.getUserById(req.user.id);

  res.status(200).json({
    success: true,
    data: {
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
    },
  });
});

export { getMe };
