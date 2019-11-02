const createError = require("http-errors");
const User = require("../models/user");

module.exports = async (req, res, next) => {
  const { authorization } = req.headers;
  if (!authorization) return next(createError(401));
  try {
    const payload = await User.decodeToken(authorization);
    req.user = await User.findById(payload._id); // built-in function takes id
    next(); // to continue excution
  } catch (err) {
    console.error(err);
    next(createError(401));
  }
};
