import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is requried"],
      trim: true,
      minLength: [2, "Name must be least 2 characters"],
      maxLength: [100, "Name connt be exceed 100 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      maxLength: [254, "Email is too long"],
    },

    password: {
      type: String,
      required: [true, "password is required"],
      select: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;
