const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const messageSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  messages: [
    {
      content: {
        type: String,
        required: true,
      },
      sentAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
});

const Message = mongoose.model("Message", messageSchema);

module.exports = Message;
