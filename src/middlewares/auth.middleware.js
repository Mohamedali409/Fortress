import jwt from "jsonwebtoken";
import AppError from "../utils/AppError.js";

const protect = (req, res, next) => {
  const cookieName = process.env.COOKIE_NAME || "access_token";
  const token = req.cookies?.[cookieName];

  if (!token) {
    return next(new AppError("Please log in to access this resource", 401));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded.sub) {
      return next(new AppError("Invalid authentication token", 401));
    }

    req.user = {
      id: decoded.sub,
    };

    next();
  } catch (error) {
    if (
      error.name === "TokenExpiredError" ||
      error.name === "JsonWebTokenError" ||
      error.name === "NotBeforeError"
    ) {
      return next(new AppError("Invalid or expired token", 401));
    }

    next(error);
  }
};

export { protect };
