const mongoose = require("mongoose");
const { users } = require("../../connection/connection.js");

const { ObjectId } = mongoose.Schema.Types;

const schema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
    },
    thumbnail: {
      name: String,
      data: Buffer,
    },
    password: {
      type: String,
      required: true,
    },

    moderators: {
      type: [ObjectId],
      ref: "users",
    },
    role: {
      type: String,
      enum: ["guest", "user", "moderator", "admin", "super-admin"],
      default: "guest",
    },
    promotedBy: {
      type: ObjectId,
      ref: "users", // Referencing the User model
    },
    verified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);
const model = users.model("users", schema, "users");

// model.createIndexes();

module.exports = model;
