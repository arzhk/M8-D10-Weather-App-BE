const jwt = require("jsonwebtoken");

const generateJWT = (payload) =>
  new Promise((res, rej) =>
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: 10000 }, (err, token) => {
      if (err) rej(err);
      res(token);
    })
  );

const generateRJWT = (payload) =>
  new Promise((res, rej) =>
    jwt.sign(payload, process.env.REFRESH_SECRET, { expiresIn: 30000 }, (err, token) => {
      if (err) rej(err);
      res(token);
    })
  );

const verifyJWT = (token) =>
  new Promise((res, rej) =>
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) rej(err);
      res(decoded);
    })
  );

const verifyRJWT = (token) =>
  new Promise((res, rej) =>
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) rej(err);
      res(decoded);
    })
  );

const authorise = async (req, res, next) => {
  if (req.cookies.accessToken) {
    const token = req.cookies.accessToken;
    const { _id } = await verifyJWT(token);

    if (_id) {
      req.id = _id;
      next();
    } else {
      throw new Error("Invalid Token");
    }
  } else {
    next();
  }
};

module.exports = { generateJWT, generateRJWT, verifyJWT, verifyRJWT, authorise };
