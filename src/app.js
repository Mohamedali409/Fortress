import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import errorHandler from "./middlewares/error.middleware.js";

//routers
import authRouter from "./modules/auth/auth.routes.js";
import userRouter from "./modules/users/user.routes.js";

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  }),
);

app.use(express.json({ limit: "10kb" }));
app.use(cookieParser());

app.get("/api/health", (req, res) => {
  res
    .status(200)
    .json({ success: true, message: "Digital Fortress API is running" });
});

app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);

app.use(errorHandler);

export default app;
