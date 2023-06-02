const express = require("express");
const MessageModel = require("./schema/MessageModel.js");
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const email = req.query.email ? { email: req.query.email } : {};
    const messages = await MessageModel.find(email);

    if (messages.length === 0) {
      return res
        .status(404)
        .json({ message: "No messages found for this email." });
    }

    return res.status(200).json({ messages });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { email, message } = req.body;

    if ((!email, !message)) {
      return res
        .status(400)
        .send({ error: "Please Include email and message!" });
    }

    const currentTime = new Date();

    // Check if the email already exists in the database
    let existingMessage = await MessageModel.findOne({ email });

    if (existingMessage) {
      existingMessage.messages.push({
        content: message,
        sendTime: currentTime,
      });
      await existingMessage.save();
    } else {
      const newMessage = new MessageModel({
        email,
        messages: [{ content: message, sendTime: currentTime }],
      });
      await newMessage.save();
    }

    res.status(200).json({ message: "Message added successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
});

router.delete("/", async (req, res) => {
  if (req.user.role !== "admin" && req.role !== "super-admin") {
    return res
      .status(401)
      .send({ error: "You have no rights to delete messages!" });
  }
  try {
    const email = req.query.email;

    if (!email) {
      return res.status(400).json({ message: "Email parameter is missing." });
    }

    const result = await MessageModel.deleteOne({ email });

    return res.status(200).json({ message: "Message deleted successfully." });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

router.delete("/deleteone", async (req, res) => {
  if (req.user.role !== "admin" && req.role !== "super-admin") {
    return res
      .status(401)
      .send({ error: "You have no rights to delete messages!" });
  }
  try {
    const { email, id: messageId } = req.query;

    if (!email) {
      return res.status(400).json({ message: "Email parameter is missing." });
    }

    const result = await MessageModel.updateOne(
      { email },
      { $pull: { messages: { _id: messageId } } }
    );

    return res.status(200).json({ message: "Message deleted successfully." });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
