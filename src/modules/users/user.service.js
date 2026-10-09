import * as userRepository from "./user.repository.js";
import AppError from "../../utils/AppError.js";

const getUserById = async (userId) => {
  const user = await userRepository.findById(userId);

  if (!user) {
    throw new AppError("User not found", 404);
  }

  return user;
};

const getUserByEmai = async (email) => {
  const normaliazedEmail = email.trim().toLowerCase();
  const user = await userRepository.findByEmail(normaliazedEmail);
  if (!email) {
    throw new AppError("User not found", 404);
  }

  return user;
};
