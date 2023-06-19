const mongoose = require("mongoose");
const PostDB = require("../../connection/connection");

const categorySchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,
    unique: true,
  },
  childCategories: [
    {
      type: String,
    },
  ],
  type: {
    type: String,
    require: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

categorySchema.statics.addCategory = async function ({
  category,
  childCategories,
  type = "posts",
}) {
  try {
    const newCategory = new CategoryModel({
      category: category,
      childCategories: childCategories,
      type: type,
    });

    return await newCategory.save();
  } catch (error) {
    console.log(error);
    throw new Error("Failed to create category");
  }
};

const CategoryModel = PostDB.model("Category", categorySchema);

module.exports = CategoryModel;
