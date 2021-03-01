const express = require("express");
const userSchema = require("./schema");
const usersRouter = express.Router();
const bcrypt = require("bcrypt");
const { generateJWT, generateRJWT, verifyJWT, authorise } = require("./utils");

const errorHandler = async (errorText, value, httpStatusCode) => {
  const err = new Error();
  err.errors = [{ value: value, msg: errorText }];
  err.httpStatusCode = httpStatusCode || 400;
  return err;
};

usersRouter.get("/me", authorise, async (req, res, next) => {
  try {
    if (req.id) {
      const user = await userSchema.findById(req.id);
      res.status(201).send(user);
    } else {
      next(await errorHandler("Bad Auth", "N/A", 401));
    }
  } catch (error) {
    next(error);
  }
});

usersRouter.post("/login", async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const user = await userSchema.findOne({ username });
    const { _id } = user;

    if (user) {
      const isMatch = await bcrypt.compare(password, user.password);
      if (isMatch) {
        const accessToken = await generateJWT({ _id });
        const refreshToken = await generateRJWT({ _id });
        res.cookie("accessToken", accessToken, { path: "/", httpOnly: true });
        res.cookie("refreshToken", refreshToken, { path: "/refreshToken", httpOnly: true });
        res.send(user);
      } else {
        next(await errorHandler("Invalid username/password.", "N/A", 400));
      }
    } else {
      next(await errorHandler("Invalid username/password.", "N/A", 400));
    }
  } catch (error) {
    console.log(error);
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

usersRouter.get("/logout", authorise, async (req, res, next) => {
  try {
    res.cookie("accessToken", "", { expires: new Date() });
    res.status(200).send("Ok");
  } catch (error) {
    next(error);
  }
});

module.exports = usersRouter;
