const { body } = require("express-validator");

// For SignUp
const validateUserSignupInputs = [
  body("username")
    .exists()
    .withMessage("The request body must contain a 'username' property.")
    .isString()
    .withMessage("The 'username' property must be a string.")
    .isLength({ min: 4, max: 15 })
    .withMessage(
      "The 'username' property must be between 4 and 15 characters."
    ),

  body("email").isEmail().withMessage("'email' is not valid"),

  body("password")
    .isLength({ min: 6, max: 20 })
    .withMessage("The 'password' property must be at least 6 characters long"),

  body("dob")
    .exists()
    .withMessage("Date of birth is required!")
    .isDate()
    .withMessage("must be a date in the format 'YYYY-MM-DD'.")
    .custom(validateDate)
    .withMessage(
      `The 'dob' year must be between ${1980} and ${
        new Date().getFullYear() - 13
      }`
    ),
];

// For Login
const validateUserLoginInputs = [
  body("email").isString().isEmail().withMessage("'email' is not valid"),

  body("password")
    .isString()
    .isLength({ min: 6, max: 20 })
    .withMessage("The 'password' property must be at least 6 characters long"),
];

function validateDate(value) {
  const [day, month, year] = value.split("/").map((v) => parseInt(v));
  const dob = new Date(year, month - 1, day);
  const minYear = 1980;
  const maxYear = new Date().getFullYear() - 13;
  if (dob.getFullYear() < minYear || dob.getFullYear() > maxYear) {
    return false;
  }
  return true;
}

module.exports = { validateUserSignupInputs, validateUserLoginInputs };
