const mongoose = require("mongoose");

const ToolSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  keywords: {
    type: [String],
    required: true,
  },
  link: {
    type: String,
    required: true,
  },
  image: {
    data: String,
    contentType: String,
  },
});

const ToolsModel = mongoose.model("ai-tools", ToolSchema, "ai-tools");

module.exports = ToolsModel;
