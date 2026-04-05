# ChatApp — Real-Time Chat Application


A full-stack real-time chat application built with MongoDB, Express.js, React, and Node.js — powered by Socket.IO for live bi-directional messaging.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Socket.IO Client |
| Backend | Node.js, Express.js |
| Real-Time | Socket.IO |
| Database | MongoDB + Mongoose |
| Dev Tool | Nodemon |

---

## Features

- Real-time messaging with Socket.IO WebSockets
- Multiple chat rooms (general, dev, random)
- Message persistence with MongoDB
- Chat history loaded on room join (last 50 messages)
- Live typing indicators
- User join/leave notifications
- Responsive React frontend

---

## Project Structure

```
chatapp/
├── server/
│   ├── index.js          # Express + Socket.IO server
│   ├── models/
│   │   └── Message.js    # Mongoose schema
│   └── package.json
└── client/
    ├── src/
    │   ├── App.jsx
    │   ├── hooks/
    │   │   └── useSocket.js
    │   └── components/
    │       ├── Chat.jsx
    │       ├── Sidebar.jsx
    │       └── MessageInput.jsx
    └── package.json
```

---

## Prerequisites

- Node.js (v18 or above)
- MongoDB — local install or MongoDB Atlas (cloud)
- npm

---

## Installation & Setup

### 1. Clone the repository

```bash
git clone https://github.com/your-username/chatapp.git
cd chatapp
```

### 2. Start MongoDB

**Option A — Local MongoDB:**
```bash
mongod
```

**Option B — MongoDB Atlas (recommended):**
Create a free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas) and copy your connection string.

### 3. Configure environment (if using Atlas)

In `server/index.js`, replace the connection string:
```js
mongoose.connect('mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/chatapp')
```

### 4. Install and run the backend

```bash
cd server
npm install
npm run dev       # uses nodemon for auto-restart
```

You should see:
```
MongoDB connected
Server running on http://localhost:5000
```

### 5. Install and run the frontend

Open a new terminal:
```bash
cd client
npm install
npm start
```

App opens at: **http://localhost:3000**

---

## How It Works

### Socket.IO Event Flow

```
User joins room
    │
    ▼
server fetches last 50 messages from MongoDB
    │
    ▼
socket.emit('chat_history') → only to this user
    │
    ▼
React sets message history in state

User sends a message
    │
    ▼
server saves to MongoDB first
    │
    ▼
io.to(room).emit('receive_message') → broadcast to room
    │
    ▼
React appends message to state (live update)
```

### Socket Events Reference

| Event | Direction | Description |
|-------|-----------|-------------|
| `join_room` | Client → Server | Join a chat room |
| `chat_history` | Server → Client | Load past messages on join |
| `send_message` | Client → Server | Send a new message |
| `receive_message` | Server → Client | Broadcast message to room |
| `typing` | Client → Server | User started typing |
| `stop_typing` | Client → Server | User stopped typing |
| `user_joined` | Server → Client | Notify room of new user |

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/messages/:room` | Fetch message history for a room |

---

## Running Ports

| Service | Port |
|---------|------|
| MongoDB | 27017 |
| Express + Socket.IO | 5000 |
| React Dev Server | 3000 |

---

## Scripts

### Backend (`server/`)

```bash
npm start       # production start
npm run dev     # development with nodemon (auto-restart)
```

### Frontend (`client/`)

```bash
npm start       # start dev server
npm run build   # production build
```

---

## Deliverable

A working real-time chat application with:

- Live messaging across multiple rooms
- Persistent message storage via MongoDB
- Typing indicators
- Chat history on join
- Clean React UI with Socket.IO integration

---

## Author

Viraj — MERN Stack Internship, Task 1

