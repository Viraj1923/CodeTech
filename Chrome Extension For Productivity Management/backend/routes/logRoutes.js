const express = require("express");
const Log = require("../models/Log");

const router = express.Router();

router.post("/", async (req, res) => {
  const { userId, logs } = req.body;
  const userLog = await Log.findOneAndUpdate(
    { userId },
    { $push: { logs: { $each: logs } } },
    { upsert: true, new: true }
  );
  res.json(userLog);
});

router.get("/", async (req, res) => {
  const { userId } = req.query;
  const userLog = await Log.findOne({ userId });
  if (!userLog) return res.status(404).json({ message: "No logs found" });
  res.json(userLog);
});

module.exports = router;
