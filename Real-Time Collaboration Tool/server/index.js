require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

// Middleware
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:3000" }));
app.use(express.json());

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI || "mongodb://localhost:27017/collabtool")
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Error:", err));

// --- Mongoose Models ---
const documentSchema = new mongoose.Schema(
  {
    roomId: { type: String, required: true, unique: true },
    title: { type: String, default: "Untitled Document" },
    content: { type: String, default: "" },
    activeUsers: [{ id: String, name: String, color: String }],
  },
  { timestamps: true }
);

const whiteboardSchema = new mongoose.Schema(
  {
    roomId: { type: String, required: true, unique: true },
    title: { type: String, default: "Untitled Whiteboard" },
    strokes: { type: Array, default: [] },
    activeUsers: [{ id: String, name: String, color: String }],
  },
  { timestamps: true }
);

const Document = mongoose.model("Document", documentSchema);
const Whiteboard = mongoose.model("Whiteboard", whiteboardSchema);

// --- REST API Routes ---
app.get("/api/health", (req, res) => res.json({ status: "OK" }));

// Get or create document room
app.get("/api/document/:roomId", async (req, res) => {
  try {
    let doc = await Document.findOne({ roomId: req.params.roomId });
    if (!doc) {
      doc = await Document.create({ roomId: req.params.roomId });
    }
    res.json(doc);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get or create whiteboard room
app.get("/api/whiteboard/:roomId", async (req, res) => {
  try {
    let wb = await Whiteboard.findOne({ roomId: req.params.roomId });
    if (!wb) {
      wb = await Whiteboard.create({ roomId: req.params.roomId });
    }
    res.json(wb);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// List all rooms
app.get("/api/rooms", async (req, res) => {
  try {
    const docs = await Document.find({}, "roomId title updatedAt").sort({ updatedAt: -1 }).limit(10);
    const wbs = await Whiteboard.find({}, "roomId title updatedAt").sort({ updatedAt: -1 }).limit(10);
    res.json({ documents: docs, whiteboards: wbs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- User color palette ---
const USER_COLORS = [
  "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4",
  "#FFEAA7", "#DDA0DD", "#98D8C8", "#F7DC6F",
  "#BB8FCE", "#85C1E9",
];

// Track rooms and users in memory (for presence)
const roomUsers = {}; // { roomId: { socketId: { name, color, cursor } } }
// Chat history in memory (last 100 msgs per room)
const chatHistory = {}; // { roomId: [msg] }
// Whiteboard undo stacks per room
const wbUndoStacks = {}; // { roomId: [strokes snapshot] }

// --- Socket.IO ---
io.on("connection", (socket) => {
  console.log(`🔌 Connected: ${socket.id}`);

  // ===== DOCUMENT EVENTS =====
  socket.on("join-document", async ({ roomId, userName }) => {
    socket.join(`doc:${roomId}`);

    if (!roomUsers[`doc:${roomId}`]) roomUsers[`doc:${roomId}`] = {};
    const color = USER_COLORS[Object.keys(roomUsers[`doc:${roomId}`]).length % USER_COLORS.length];
    roomUsers[`doc:${roomId}`][socket.id] = { name: userName, color, id: socket.id };

    // Send current document state
    const doc = await Document.findOne({ roomId });
    if (doc) socket.emit("document-state", { content: doc.content, title: doc.title });

    // Broadcast updated user list
    io.to(`doc:${roomId}`).emit("users-update", Object.values(roomUsers[`doc:${roomId}`]));
    console.log(`📄 ${userName} joined doc room: ${roomId}`);
  });

  socket.on("document-change", async ({ roomId, content, delta }) => {
    // Broadcast to others in the room
    socket.to(`doc:${roomId}`).emit("document-update", { content, delta });
    // Save to DB (debounced in client, but we save every change here too)
    await Document.updateOne({ roomId }, { content }, { upsert: true });
  });

  socket.on("document-title-change", async ({ roomId, title }) => {
    socket.to(`doc:${roomId}`).emit("document-title-update", { title });
    await Document.updateOne({ roomId }, { title }, { upsert: true });
  });

  socket.on("cursor-move", ({ roomId, cursor, userName }) => {
    const user = roomUsers[`doc:${roomId}`]?.[socket.id];
    if (user) {
      socket.to(`doc:${roomId}`).emit("cursor-update", {
        id: socket.id,
        cursor,
        userName,
        color: user.color,
      });
    }
  });

  // ===== WHITEBOARD EVENTS =====
  socket.on("join-whiteboard", async ({ roomId, userName }) => {
    socket.join(`wb:${roomId}`);

    if (!roomUsers[`wb:${roomId}`]) roomUsers[`wb:${roomId}`] = {};
    const color = USER_COLORS[Object.keys(roomUsers[`wb:${roomId}`]).length % USER_COLORS.length];
    roomUsers[`wb:${roomId}`][socket.id] = { name: userName, color, id: socket.id };

    const wb = await Whiteboard.findOne({ roomId });
    if (wb) socket.emit("whiteboard-state", { strokes: wb.strokes, title: wb.title });

    io.to(`wb:${roomId}`).emit("users-update", Object.values(roomUsers[`wb:${roomId}`]));
    console.log(`🎨 ${userName} joined whiteboard room: ${roomId}`);
  });

  socket.on("draw-stroke", async ({ roomId, stroke }) => {
    socket.to(`wb:${roomId}`).emit("new-stroke", { stroke });
    await Whiteboard.updateOne({ roomId }, { $push: { strokes: stroke } }, { upsert: true });
  });

  socket.on("draw-live", ({ roomId, points, color, width, tool }) => {
    socket.to(`wb:${roomId}`).emit("live-draw", {
      id: socket.id,
      points,
      color,
      width,
      tool,
    });
  });

  socket.on("whiteboard-clear", async ({ roomId }) => {
    await Whiteboard.updateOne({ roomId }, { strokes: [] }, { upsert: true });
    io.to(`wb:${roomId}`).emit("whiteboard-cleared");
  });

  socket.on("whiteboard-title-change", async ({ roomId, title }) => {
    socket.to(`wb:${roomId}`).emit("whiteboard-title-update", { title });
    await Whiteboard.updateOne({ roomId }, { title }, { upsert: true });
  });

  // ===== CHAT EVENTS =====
  socket.on("get-chat-history", ({ roomId }) => {
    const history = chatHistory[roomId] || [];
    socket.emit("chat-history", history);
  });

  socket.on("chat-message", (msg) => {
    const { roomId } = msg;
    if (!chatHistory[roomId]) chatHistory[roomId] = [];
    chatHistory[roomId].push(msg);
    if (chatHistory[roomId].length > 100) chatHistory[roomId].shift();
    io.to(`doc:${roomId}`).emit("chat-message", msg);
    io.to(`wb:${roomId}`).emit("chat-message", msg);
  });

  // ===== WHITEBOARD UNDO/REDO =====
  socket.on("whiteboard-undo", async ({ roomId }) => {
    const wb = await Whiteboard.findOne({ roomId });
    if (!wb || wb.strokes.length === 0) return;
    if (!wbUndoStacks[roomId]) wbUndoStacks[roomId] = [];
    wbUndoStacks[roomId].push([...wb.strokes]);
    wb.strokes.pop();
    await wb.save();
    io.to(`wb:${roomId}`).emit("whiteboard-state", { strokes: wb.strokes, title: wb.title });
  });

  socket.on("whiteboard-redo", async ({ roomId }) => {
    if (!wbUndoStacks[roomId] || wbUndoStacks[roomId].length === 0) return;
    const restoredStrokes = wbUndoStacks[roomId].pop();
    await Whiteboard.updateOne({ roomId }, { strokes: restoredStrokes }, { upsert: true });
    io.to(`wb:${roomId}`).emit("whiteboard-state", { strokes: restoredStrokes });
  });

  // ===== DISCONNECT =====
  socket.on("disconnect", () => {
    // Remove user from all rooms
    for (const roomKey in roomUsers) {
      if (roomUsers[roomKey][socket.id]) {
        delete roomUsers[roomKey][socket.id];
        io.to(roomKey).emit("users-update", Object.values(roomUsers[roomKey]));
      }
    }
    console.log(`❌ Disconnected: ${socket.id}`);
  });
});

// Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
