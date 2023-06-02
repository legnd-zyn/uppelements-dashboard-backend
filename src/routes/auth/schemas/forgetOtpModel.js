const mongoose = require("mongoose");

const schema = mongoose.Schema(
  {
    token: {
      type: String,
    },
  },
  { timestamps: true }
);

const ForgetOtpModel = mongoose.model("forget-otp", schema, "forget-otp");
module.exports = ForgetOtpModel;
