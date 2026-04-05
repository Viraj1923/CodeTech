# CollabSpace — Real-Time Collaboration Tool

---

## 🚀 Features

- **📄 Shared Document Editor** — Multi-user live text editing with auto-save to MongoDB
- **🎨 Collaborative Whiteboard** — Draw together with pen, eraser, shapes (line, rect, circle), colors, brush sizes
- **👥 Live Presence** — See who's in the room with colored avatars and user count
- **🔗 Shareable Rooms** — Generate a room ID and share it; anyone with the ID can join instantly
- **💾 Persistent Storage** — All documents and whiteboard strokes saved to MongoDB
- **🔄 Real-Time Sync** — Zero-lag updates via Socket.IO WebSocket connections

---

## 🏗️ Architecture

```
collab-tool/
├── server/               ← Node.js + Express + Socket.IO
│   ├── index.js          ← Main server: REST API + WebSocket handlers
│   ├── .env              ← MongoDB URI, PORT, CLIENT_URL
│   └── package.json
│
├── client/               ← React (Create React App)
│   ├── src/
│   │   ├── App.js        ← Router setup
│   │   ├── App.css       ← All styles
│   │   ├── context/
│   │   │   └── SocketContext.js   ← Global socket connection
│   │   ├── pages/
│   │   │   ├── HomePage.js        ← Landing + room creation
│   │   │   ├── DocumentEditor.js  ← Live text editor
│   │   │   └── WhiteboardPage.js  ← Canvas whiteboard
│   │   └── components/
│   │       └── UserAvatars.js     ← Presence avatars
│   └── package.json
│
└── package.json          ← Root: run both with `npm run dev`
```

---

## ⚙️ Setup & Run

### Prerequisites
- Node.js v16+
- MongoDB running locally (`mongod`) OR MongoDB Atlas URI

### 1. Install Dependencies
```bash
# From project root
npm install          # installs concurrently
npm run install-all  # installs server + client deps
```

### 2. Configure Environment
Edit `server/.env`:
```env
PORT=5000
MONGO_URI=url
CLIENT_URL=http://localhost:3000
```

### 3. Start Development Servers
```bash
npm run dev
```
- **Backend**: http://localhost:5000
- **Frontend**: http://localhost:3000

---

## 📡 WebSocket Events

### Document Room
| Event (Client → Server) | Payload | Description |
|---|---|---|
| `join-document` | `{ roomId, userName }` | Join a doc room |
| `document-change` | `{ roomId, content }` | Broadcast text change |
| `document-title-change` | `{ roomId, title }` | Update room title |
| `cursor-move` | `{ roomId, cursor, userName }` | Broadcast cursor position |

| Event (Server → Client) | Payload | Description |
|---|---|---|
| `document-state` | `{ content, title }` | Initial state on join |
| `document-update` | `{ content }` | Remote user's edit |
| `users-update` | `[{ id, name, color }]` | Active user list |

### Whiteboard Room
| Event (Client → Server) | Payload | Description |
|---|---|---|
| `join-whiteboard` | `{ roomId, userName }` | Join whiteboard |
| `draw-stroke` | `{ roomId, stroke }` | Commit completed stroke |
| `draw-live` | `{ roomId, points, color, width, tool }` | Live drawing preview |
| `whiteboard-clear` | `{ roomId }` | Clear entire board |

| Event (Server → Client) | Payload | Description |
|---|---|---|
| `whiteboard-state` | `{ strokes, title }` | All saved strokes on join |
| `new-stroke` | `{ stroke }` | Remote committed stroke |
| `live-draw` | `{ id, points, color, width, tool }` | Remote live preview |
| `whiteboard-cleared` | — | Board was cleared |

---

## 🗃️ MongoDB Models

### Document
```js
{
  roomId: String (unique),
  title: String,
  content: String,      // full text content
  activeUsers: Array,
  createdAt, updatedAt
}
```

### Whiteboard
```js
{
  roomId: String (unique),
  title: String,
  strokes: Array,       // [{points, color, width, tool}]
  activeUsers: Array,
  createdAt, updatedAt
}
```

---

## 🔌 REST API

| Method | Route | Description |
|---|---|---|
| GET | `/api/health` | Health check |
| GET | `/api/document/:roomId` | Get/create document room |
| GET | `/api/whiteboard/:roomId` | Get/create whiteboard room |
| GET | `/api/rooms` | List recent rooms |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, React Router v6 |
| Real-time | Socket.IO Client |
| Backend | Node.js, Express |
| WebSocket | Socket.IO Server |
| Database | MongoDB + Mongoose |
| Dev Tools | Nodemon, Concurrently |

---

## 💡 How to Use

1. Open http://localhost:3000
2. Enter your name
3. Choose **Document Editor** or **Whiteboard**
4. Click **Create New Room** — you get a unique Room ID
5. Share the Room ID with collaborators
6. They enter the same Room ID and join your session instantly!
