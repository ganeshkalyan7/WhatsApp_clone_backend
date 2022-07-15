const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const messageSchema = new Schema(
  {
    name: String,
    message: String,
    timestamp: String,
    uid: String,
    roomId: String,
  },
  {
    timestamps: true,
  }
);
const Messages = mongoose.model("messages", messageSchema);
module.exports = Messages;
