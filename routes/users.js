const express = require("express");
const createError = require("http-errors");
const User = require(`../models/user`);
authenticationMiddleware = require(`../middleware/authentication`);
const router = express.Router();
// base /users

// users/login
router.post("/login", async (req, res, next) => {
  const { username, password } = req.body;
  createError(500, "mis");
  // console.log(req.body);
  if (!username || !password)
    return next(createError(400, "missing arguments"));
  const user = await User.findOne({ username });
  if (!user) return next(createError(401));
  const isMatch = await user.verifyPassword(password).catch(console.error);
  // console.log(isMatch);
  if (!isMatch) return next(createError(401));

  const token = await user.generateToken();
  // console.log(token);
  res.send({ token, user });
});

// users/register user
router.post("/register", async (req, res, next) => {
  const { username, password } = req.body;
  const user = new User({ username, password });
  user.save(err => {
    if (err) return next(createError(400, err));
    res.send(user);
  });
});

// protect endpoint login authentication
router.get("/", authenticationMiddleware, (req, res, next) => {
  res.send(req.user._id);
});
module.exports = router;
