const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const services = require("./services");
const cookieParser = require("cookie-parser");
const { errorProcessor } = require("./errorHandling");

const server = express();
const port = process.env.PORT || 3001;

const loggerMiddleware = (req, res, next) => {
  console.log(`Logged ${req.url} ${req.method} -- ${new Date()}`);
  next();
};

const whitelist = ["http://localhost:3000"];
const corsOptions = {
  origin: (origin, callback) => {
    if (whitelist.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
};
server.use(cors(corsOptions));
server.use(express.json());
server.use(cookieParser());
server.use(loggerMiddleware);

server.use("/api", services);

server.use(errorProcessor);

mongoose
  .connect(process.env.MONGO_CONNECT, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(
    server.listen(port, () => {
      console.log("Server is running on port: ", port);
    })
  );

// TO GENERATE A SECRET TYPE openssl rand -base64 172 into the terminal
// If leaked, can generate jwt tokens for project -- BAD!
