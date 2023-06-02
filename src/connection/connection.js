const mongoose = require("mongoose");
require("dotenv").config();
mongoose.set("strictQuery", true);

const POST = process.env.POST_DB_URI;
const USERS = process.env.USER_DB_URI;

mongoose.connect(POST, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const UsersDB = mongoose.createConnection(USERS, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const PostsDB = mongoose.connection;

PostsDB.on("error", console.error.bind(console, "connection error:"));
PostsDB.once("open", function () {
  console.log("Connected to MongoDB Posts");
});

UsersDB.on("error", console.error.bind(console, "connection error:"));
UsersDB.once("open", function () {
  console.log("Connected to MongoDB Users!");
});

module.exports = PostsDB;
module.exports.users = UsersDB;
