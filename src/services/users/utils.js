const jwt = require("jsonwebtoken");

const generateJWT = (payload) =>
  new Promise((res, rej) =>
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: 10000 }, (err, token) => {
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

const authorise = async (req, res, next) => {
  const token = req.cookies.accessToken;
  const { username } = await verifyJWT(token);
  req.username = username;
  next();
};

module.exports = { generateJWT, verifyJWT, authorise };
