const router = require("express").Router();

const usersRouter = require("./users");
/* const weatherRouter = require("./weather"); */

router.use("/users", usersRouter);
/* router.use("/weather", weatherRouter); */

module.exports = router;
