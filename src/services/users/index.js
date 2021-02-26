const express = require("express");
const userSchema = require(".schema");
const jwt = require("jsonwebtoken");
const usersRouter = express.Router();
const bcrypt = require("bcrypt");
const { generateJWT, verifyJWT, authorise } = require("./utils");

const errorHandler = async (errorText, value, httpStatusCode) => {
  const err = new Error();
  err.errors = [{ value: value, msg: errorText }];
  err.httpStatusCode = httpStatusCode || 400;
  return err;
};

usersRouter.post("/login", async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const user = userSchema.findOne({ username });
    if (user) {
      bcrypt.compare(password, user.password, async function (err, isMatch) {
        if (err) {
          throw err;
        } else if (!isMatch) {
          next(await errorHandler("Invalid username/password.", "N/A", 400));
        } else {
          const token = await generateJWT(user._id);
          res.cookie("accessToken", token, { path: "/", httpOnly: true, expiresIn: 10000 });
          res.status(200).send(user);
        }
      });
    } else {
      next(await errorHandler("Invalid username/password.", "N/A", 400));
    }
  } catch (error) {
    next(error);
  }
});

module.exports = usersRouter;
