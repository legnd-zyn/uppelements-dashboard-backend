const { validationResult } = require("express-validator");

const sendRejections = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(401).send({ error: "invalid credentials" });
  }

  next();
};

module.exports = { sendRejections };
