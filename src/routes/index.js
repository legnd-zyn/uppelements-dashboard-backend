const express = require("express");
const Router = express.Router();

Router.use("/posts", require("./posts/index.js"));
Router.use("/it-solutions", require("./it-solutions"));
Router.use("/ai-tools", require("./ai-tools"));
Router.use("/categories", require("./categories"));
Router.use("/messages", require("./messages/messages.js"));

Router.get("/role", (req, res) => {
  return res.status(200).json({ role: req?.role });
});
Router.get("/user", (req, res) => {
  return res.status(200).json({ id: req?.user?.id });
});

Router.use("/auth/signup", require("./auth/signup"));
Router.use("/auth/login", require("./auth/login"));
Router.use("/auth/users", require("./users"));
Router.use("/auth/forget", require("./auth/forget"));

module.exports = Router;
