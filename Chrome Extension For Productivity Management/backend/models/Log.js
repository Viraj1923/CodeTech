const mongoose = require("mongoose");

const logSchema = new mongoose.Schema({
  userId: String,
  logs: [{ url: String, timeSpent: Number, date: Date }],
});

module.exports = mongoose.model("Log", logSchema);
