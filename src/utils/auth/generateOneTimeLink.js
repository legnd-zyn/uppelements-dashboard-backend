const jwt = require("jsonwebtoken");

require("dotenv").config();

function generateOneTimeLink({
  email = false,
  id = false,
  token = false,
  forget = false,
}) {
  // Sign the OTP with a JWT
  const data = {};
  if (email) {
    data.email = email;
  }
  if (id) {
    data.id = id;
  }
  if (!token) {
    token = jwt.sign(data, process.env.EXCESS_TOKEN_SECRET, {
      expiresIn: "5m",
    });
  }

  const link = `${process.env.DOMAIN}/auth/${
    forget ? "forget" : "signup"
  }/verify?token=${token}${!forget ? `&email=${email}` : ""}`;
  console.log(link);
  return link;
}

module.exports = generateOneTimeLink;
