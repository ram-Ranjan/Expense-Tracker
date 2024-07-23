const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.TOKEN_SECRET;

exports.authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(" ")[1];
    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (err) {
        return res.sendStatus(403);
      }
      req.user = user; //Then only req will have authorised user
      next();
    });
  } else {
    res.sendStatus(401);
  }
};
