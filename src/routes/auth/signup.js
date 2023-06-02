const express = require("express");
const generateOneTimeLink = require("../../utils/auth/generateOneTimeLink");
const verifyOneTimeLink = require("../../utils/auth/verifyOneTimeLink");
const verifyUserUsingEmail = require("../../utils/auth/verifyUserUsingEmail");
const { sendMail } = require("../../utils/sendMail");
const userModel = require("../schemas/create-user-schema");
const bcrypt = require("bcrypt");

const router = express.Router();

router.post("/", async (req, res) => {
  const { username, email, password, fullname } = req.body;

  // hash the password using bcrypt

  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const userObj = { username, email, password: hashedPassword };

    const user = new userModel(userObj);
    const save = await user.save();

    const link = generateOneTimeLink({ email });
    await sendMail({
      email,
      link,
    });

    return res.status(200).send({
      message: "verification link has been sent to your mail account",
    });
  } catch (error) {
    console.log(error);
    if (error.code === 11000) {
      return res
        .status(409)
        .json({ error: "account with this email already exists!" });
    }

    return res
      .status(500)
      .json({ error: "something went wrong. Please try again later." });
  }
});

router.get("/resend-verification-link", async (req, res) => {
  const email = req.query.email;

  if (!email) {
    return res.status(400).send({ error: "Email is required" });
  }

  try {
    const user = await userModel.findOne({ email });

    if (!user) {
      return res
        .status(404)
        .send({ error: "Account with this email does not exist." });
    }

    if (user.verified) {
      return res.status(400).send({ error: "Account is already verified" });
    }

    const link = generateOneTimeLink({ email });
    await sendMail({
      email,
      link,
    });

    return res.status(200).send({
      message: "Verification link has been sent to your email account.",
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ error: "Something went wrong. Please try again later." });
  }
});

router.get("/verify", async (req, res) => {
  const { token } = req.query;

  try {
    // verify token
    const result = await verifyOneTimeLink({ token });

    // verify user & set role to user
    const verified = await verifyUserUsingEmail(result);

    res.status(200).send("User has been verified successfully!");
  } catch (error) {
    res.status(401).send({ error: "Link has expired or is invalid" });
  }
});

module.exports = router;
