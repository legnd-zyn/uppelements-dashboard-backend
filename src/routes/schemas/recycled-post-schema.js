const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types;

const recycledPostSchema = new mongoose.Schema({
  title: {
    type: String,
  },
  description: {
    type: String,
  },
  author: {
    type: ObjectId,
    ref: "users",
  },
  body: {
    type: String,
  },
  slug: {
    type: String,
  },
  category: {
    type: String,
  },
  subCategory: {
    type: String,
  },
  image: {
    data: String,
    contentType: String,
  },
  comments: {
    type: [
      {
        body: String,
        author: {
          type: ObjectId,
          ref: "users",
        },
        date: {
          type: Date,
          default: Date.now(),
        },
      },
    ],
  },
  recycledAt: {
    type: Date,
    default: Date.now,
  },
  recycledBy: {
    type: ObjectId,
    ref: "users",
  },
  createdAt: {
    type: Date,
  },
  updatedAt: {
    type: Date,
  },
});

const RecycledPostModel = mongoose.model(
  "recycled_posts",
  recycledPostSchema,
  "recycled_posts"
);
module.exports = RecycledPostModel;
