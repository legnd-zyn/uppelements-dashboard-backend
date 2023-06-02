const mongoose = require("mongoose");
const { users } = require("../../connection/connection");

const schema = new mongoose.Schema(
  {
    hexStr: {
      type: String,
      unique: true,
    },
    token: {
      type: String,
      unique: true,
    },
    expireAt: {
      type: Date,
      /* Defaults 7 days from now */
      default: new Date(new Date().valueOf() + 600000),
      /* Remove doc 60 seconds after specified date */
      expires: 60,
    },
  },
  { timestamps: true }
);

const model = users.model("signupotp", schema, "signupotps");

function saveOtpToDb({ hexStr, token }) {
  return new Promise(async (resolve, reject) => {
    try {
      const otp = new model({ hexStr, token });
      const save = await otp.save();
      resolve({ status: "SUCCESS" });
    } catch (error) {
      reject({ error });
    }
  });
}

module.exports = saveOtpToDb;
module.exports.otpModel = model;
