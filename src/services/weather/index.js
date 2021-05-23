const express = require("express");
const User = require("../users/schema");
const { authorise } = require("../users/utils");
const weatherRouter = express.Router();

const errorHandler = async (errorText, value, httpStatusCode) => {
  const err = new Error();
  err.errors = [{ value: value, msg: errorText }];
  err.httpStatusCode = httpStatusCode || 400;
  return err;
};

weatherRouter.post("/favourite", authorise, async (req, res, next) => {
  try {
    const user = await User.findOne({ _id: req.id });
    console.log(req.body.location);
    if (user) {
      if (user.favourites.findIndex((favourite) => favourite.location === req.body.location) === -1) {
        await User.updateOne(
          { _id: req.id },
          { $push: { favourites: { location: req.body.location, country: req.body.country, pinned: false } } }
        );
      } else {
        console.log("aa");
        await User.updateOne({ _id: req.id }, { $pull: { favourites: { location: req.body.location } } });
      }
      const user_updated = await User.findOne({ _id: req.id });
      return res.send(user_updated);
    }
    return next(await errorHandler("Unable to find user.", req.id, 404));
  } catch (error) {
    console.log(error);
    next(await errorHandler(error));
  }
});

module.exports = weatherRouter;
