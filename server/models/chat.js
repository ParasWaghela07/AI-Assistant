const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    messages: [{ 
        sender: { type: String, required: true },
        content: { type: String, required: true },
     }],
  },
  { timestamps: true }
);

const Chat = mongoose.model('Chat', chatSchema);

module.exports = Chat;
