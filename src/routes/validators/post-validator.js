const { body } = require("express-validator");
const validatePostInputs = [body("title").isString().isLength({ min: 10 })];

module.exports = { validatePostInputs };
