import jwt from "jsonwebtoken";
import { cookieName } from "../config/auth-cookie.js";
import AppError from "../utils/AppError.js";

const protect = (req, res, next) => {
  const token = req.cookies?.[cookieName];

  if (!token) {
    return next(new AppError("Please log in to access this resource", 401));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ["HS256"],
    });

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
