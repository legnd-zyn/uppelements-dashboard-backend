const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { otpModel } = require("./saveOtpToDb");
require("dotenv").config();

function verifyOneTimeLink({ token }) {
  return new Promise(async (resolve, reject) => {
    try {
      const { email } = jwt.verify(token, process.env.EXCESS_TOKEN_SECRET);

      resolve({ email });
    } catch (error) {
      reject("Link has expired or is invalid");
    }
  });
}

module.exports = verifyOneTimeLink;
