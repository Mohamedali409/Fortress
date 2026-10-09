import User from "./user.model.js";

const findByEmail = (email) => {
  return User.findOne({ email }).select("+password");
};

const findById = (userId) => {
  return User.findById(userId);
};

const create = (userData) => {
  return User.create(userData);
};
export { findByEmail, findById, create };
