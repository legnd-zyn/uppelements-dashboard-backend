const crypto = require("crypto");

function generateRandomStr(length = 30) {
  const rndmstr = crypto.randomBytes(length).toString("hex");
  if (rndmstr.match(/[\/,.-]/g)) {
    generateRandomStr();
    return;
  }
  return rndmstr;
}

module.exports = generateRandomStr;
