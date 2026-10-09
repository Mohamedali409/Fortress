import AppError from "../utils/AppError.js";

const validate = (schema, property = "body") => {
  return (req, res, next) => {
    const result = schema.safeParse(req[property]);

    if (!result.success) {
      const message = result.error.issues
        .map((issue) => {
          const field = issue.path.join(".");
          return `${field}: ${issue.message}`;
        })
        .join(", ");

      return next(new AppError(message, 400));
    }

    req[property] = result.data;

    next();
  };
};

export default validate;
