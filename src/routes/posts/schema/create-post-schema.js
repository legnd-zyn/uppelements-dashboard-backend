const mongoose = require("mongoose");

const { ObjectId } = mongoose.Schema.Types;

const schema = mongoose.Schema(
  {
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
      // required: true,
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
  },
  { timestamps: true }
);

const PostModel = mongoose.model("posts", schema, "posts");
// model.createIndexes({ createdAt: 1 });
module.exports = PostModel;
