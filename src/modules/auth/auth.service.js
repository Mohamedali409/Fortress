import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import * as userRepository from "../users/user.repository.js";
import AppError from "../../utils/AppError.js";

const register = async ({ name, email, password }) => {
  // chech email
  // hash email
  // save new user
  //return only safe user data

  const existingEmail = await userRepository.findByEmail(email);
  if (existingEmail) throw new AppError("Email already exists", 409);

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await userRepository.create({
    name,
    email,
    password: hashedPassword,
  });

  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
  };
};

const login = async ({ email, password }) => {
  // find user By email
  // compare password
  // JWT Generated

  const user = await userRepository.findByEmail(email);

  if (!user) throw new AppError("Invalid email or Password", 401);

  const isPasswordCorrect = await bcrypt.compare(password, user.password);

  if (!isPasswordCorrect) throw new AppError("Invalid email or password", 401);

  const token = jwt.sign({ sub: user._id.toString() }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  return {
    user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
    },
    token,
  };
};

export { register, login };
