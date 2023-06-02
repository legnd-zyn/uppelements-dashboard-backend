const user = require("../../routes/schemas/create-user-schema");

function verifyUserUsingEmail({ email }) {
  return new Promise(async (resolve, reject) => {
    try {
      const userUpdated = await user.findOneAndUpdate(
        { email: email },
        { verified: true, role: "user" }
      );

      resolve("user verified successfully");
    } catch (error) {
      reject("error while verifying user!");
    }
  });
}

module.exports = verifyUserUsingEmail;
