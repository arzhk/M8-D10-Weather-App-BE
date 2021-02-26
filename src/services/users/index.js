const express = require("express");
const userSchema = require("./schema");
const usersRouter = express.Router();
const bcrypt = require("bcrypt");
const { generateJWT, verifyJWT, authorise } = require("./utils");

const errorHandler = async (errorText, value, httpStatusCode) => {
  const err = new Error();
  err.errors = [{ value: value, msg: errorText }];
  err.httpStatusCode = httpStatusCode || 400;
  return err;
};

usersRouter.get("/me", authorise, async (req, res, next) => {
  try {
    const user = await userSchema.findOneById(req.id);
    res.status(201).send(user);
  } catch (error) {
    next(error);
  }
});

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
          const accessToken = await generateJWT(user._id);
          const refreshToken = await generateRJWT(user._id);
          res.cookie("accessToken", accessToken, { path: "/", httpOnly: true });
          res.cookie("refreshToken", refreshToken, { path: "/refreshToken", httpOnly: true });
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

usersRouter.post("/register", async (req, res, next) => {
  try {
    const newUser = new userSchema(req.body);
    if (newUser) {
      await newUser.save();
      res.status(201).send(newUser);
    } else next();
  } catch (error) {
    console.log(error);
    next(error);
  }
});

usersRouter.put("/update", authorise, async (req, res, next) => {
  try {
    const user = await userSchema.findOne({ username: req.body.username });
    if (user) {
      const updatedUser = await userSchema.findByIdAndUpdate(user._id, req.body, { runValidators: true, new: true });
      if (updatedUser) res.send("User data updated.");
      else next(await errorHandler("", user._id, 500));
    } else next(await errorHandler("User not found.", user._id, 404));
  } catch (error) {
    next(error);
  }
});

module.exports = usersRouter;
