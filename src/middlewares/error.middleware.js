import AppError from "../utils/AppError.js";

const errorHandler = (err, req, res, next) => {
  let error = err;

  // MongoDB duplicate key error
  if (error.code === 11000) {
    const field = Object.keys(error.keyPattern || {})[0];

    error = new AppError(
      field === "email" ? "Email already exists" : "Duplicate value",
      409,
    );
  }

  // Mongoose validation error
  if (error.name === "ValidationError") {
    const message = Object.values(error.errors)
      .map((item) => item.message)
      .join(", ");

    error = new AppError(message, 400);
  }

  // Invalid MongoDB ObjectId
  if (error.name === "CastError") {
    error = new AppError("Invalid resource identifier", 400);
  }

  const statusCode = error.statusCode || 500;
  const isProduction = process.env.NODE_ENV === "production";

  const response = {
    success: false,
    message:
      statusCode >= 500 && isProduction
        ? "Internal server error"
        : error.message || "Something went wrong",
  };

  if (!isProduction && error.stack) {
    response.stack = error.stack;
  }

  res.status(statusCode).json(response);
};

export default errorHandler;
