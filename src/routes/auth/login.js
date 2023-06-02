const express = require("express");
const jwt = require("jsonwebtoken");
const UserModel = require("../schemas/create-user-schema");
const router = express.Router();
const bcrypt = require("bcrypt");
require("dotenv").config();

const secret = process.env.EXCESS_TOKEN_SECRET;

router.post("/", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await UserModel.findOne({ email });

    if (!user) {
      return res.status(401).json({
        message: "Authentication failed",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Authentication failed",
      });
    }

    if (!user.verified) {
      return res.status(403).json({
        message: "User is not verified",
      });
    }

    const payload = {
      id: user._id.toString(),
    };

    const options = {
      expiresIn: "3h",
    };

    const token = jwt.sign(payload, secret, options);

    const domain =
      process.env.NODE_ENV === "production"
        ? "dashboard.uppelements.com"
        : "localhost";

    return res.cookie("cookieName", 25, { maxAge: 900000 }).status(200).json({
      message: "User authenticated",
      role: user.role,
      token,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: "Authentication failed",
    });
  }
});

module.exports = router;
