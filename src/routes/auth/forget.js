const express = require("express");
const jwt = require("jsonwebtoken");
const UserModel = require("../schemas/create-user-schema");
const router = express.Router();
const bcrypt = require("bcrypt");
const ForgetOtpModel = require("./schemas/forgetOtpModel");
const { sendForgetLink } = require("../../utils/sendForgetMail");
const generateOneTimeLink = require("../../utils/auth/generateOneTimeLink");
require("dotenv").config();

const secret = process.env.EXCESS_TOKEN_SECRET;

router.post("/", async (req, res) => {
  const { email } = req.body;

  try {
    const user = await UserModel.findOne({ email });

    if (!user) {
      return res.status(401).json({
        message: "User not found",
      });
    }

    const token = jwt.sign({ id: user._id }, secret, {
      expiresIn: "5m",
    });

    const link = generateOneTimeLink({ email, token, forget: true });

    console.log(link);
    const DbToken = new ForgetOtpModel({ token });
    await DbToken.save();
    const linkSended = await sendForgetLink({ email: email, link });

    return res.status(200).json({
      message: "Password reset email sent",
      link: link,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Error resetting password",
    });
  }
});

router.get("/check-token", async (req, res) => {
  const { token } = req.query;

  try {
    const decodedToken = jwt.verify(token, secret);

    const exist = await ForgetOtpModel.findOne({ token });

    if (!exist) {
      return res.status(409).json({
        valid: false,
        error: "OTP has already been used",
      });
    }

    return res.status(200).json({
      valid: true,
    });
  } catch (error) {
    console.log("Check Token ", error);
    return res.status(401).json({
      valid: false,
    });
  }
});

router.post("/reset-password", async (req, res) => {
  const { password } = req.body;
  const { token } = req.query;

  try {
    const decodedToken = jwt.verify(token, secret);

    const otpFromDb = await ForgetOtpModel.findOne({ token: token });

    if (!otpFromDb) {
      return res.status(409).json({
        error: "OTP has already been used",
      });
    }

    const user = await UserModel.findById(decodedToken.id);

    if (!user) {
      return res.status(401).json({
        message: "Invalid token",
      });
    }

    console.log(otpFromDb);

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;

    await user.save();
    await otpFromDb.remove();

    return res.status(200).json({
      message: "Password updated",
    });
  } catch (error) {
    console.log("verify token ", error);
    return res.status(500).json({
      error: "Error resetting password",
    });
  }
});

module.exports = router;
