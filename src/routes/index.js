const express = require("express");
const Router = express.Router();

const post = require("./post");
const users = require("./users");
const signup = require("./auth/signup");
const login = require("./auth/login");
const forget = require("./auth/forget");
const messages = require("./messages/messages.js");

Router.use("/posts", post);
Router.use("/it-solutions", require("./it-solutions"));
Router.use("/ai-tools", require("./ai-tools"));
Router.use("/categories", require("./categories"));
Router.use("/messages", messages);
Router.get("/role", (req, res) => {
  return res.status(200).json({ role: req?.role });
});
Router.get("/user", (req, res) => {
  return res.status(200).json({ id: req?.user?.id });
});

Router.use("/auth/signup", signup);
Router.use("/auth/login", login);
Router.use("/auth/users", users);
Router.use("/auth/forget", forget);

module.exports = Router;
