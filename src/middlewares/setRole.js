const jwt = require("jsonwebtoken");
const UserModel = require("../routes/schemas/create-user-schema");
require("dotenv").config();

module.exports = async function (req, res, next) {
  const bearerHeader = req.headers["authorization"];

  if (!bearerHeader || bearerHeader.toString().length < 30) {
    req.role = "guest";
    next();
    return;
  }

  const bearer = bearerHeader.split(" ");
  const bearerToken = bearer[1].replace(";", "");

  try {
    const secret = process.env.EXCESS_TOKEN_SECRET;

    const decoded = jwt.verify(bearerToken, secret);

    const user = await UserModel.findById(decoded.id).select({ password: 0 });

    req.user = user;
    req.role = user?.role;
    next();
  } catch (err) {
    console.log("error in setRole.js", err);
    res.status(401).json({ msg: "Token is not valid" });
  }
};
