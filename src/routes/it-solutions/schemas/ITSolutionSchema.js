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
    category: {
      type: String,
      // required: true,
    },
    subCategory: {
      type: String,
    },
    slug: {
      type: String,
    },
    image: {
      data: String,
      contentType: String,
    },
  },
  { timestamps: true }
);

const ITSolutionModel = mongoose.model("itsolutions", schema, "itsolutions");
// model.createIndexes({ createdAt: 1 });
module.exports = ITSolutionModel;
