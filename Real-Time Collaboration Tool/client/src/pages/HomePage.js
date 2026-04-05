import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";

const HomePage = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("");
  const [roomId, setRoomId] = useState("");
  const [rooms, setRooms] = useState({ documents: [], whiteboards: [] });
  const [activeTab, setActiveTab] = useState("document");

  useEffect(() => {
    const savedName = localStorage.getItem("collabUserName");
    if (savedName) setUserName(savedName);

    fetch("/api/rooms")
      .then((r) => r.json())
      .then((data) => setRooms(data))
      .catch(() => {});
  }, []);

  const handleJoin = (type, id) => {
    if (!userName.trim()) return alert("Please enter your name");
    const rid = id || roomId || uuidv4();
    localStorage.setItem("collabUserName", userName);
    navigate(`/${type}/${rid}?name=${encodeURIComponent(userName)}`);
  };

  return (
    <div className="home-page">
      <div className="hero">
        <div className="hero-badge">⚡ Real-Time Collaboration</div>
        <h1 className="hero-title">
          <span className="gradient-text">CollabSpace</span>
        </h1>
        <p className="hero-sub">
          Create, draw, and collaborate — together, in real time.
        </p>
      </div>

      <div className="join-card">
        <div className="input-group">
          <label>Your Name</label>
          <input
            type="text"
            placeholder="Enter your name..."
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleJoin(activeTab)}
          />
        </div>

        <div className="input-group">
          <label>Room ID <span className="optional">(optional — leave blank to create new)</span></label>
          <input
            type="text"
            placeholder="Paste a room ID to join existing..."
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
          />
        </div>

        <div className="tab-switch">
          <button
            className={activeTab === "document" ? "tab active" : "tab"}
            onClick={() => setActiveTab("document")}
          >
            📄 Document Editor
          </button>
          <button
            className={activeTab === "whiteboard" ? "tab active" : "tab"}
            onClick={() => setActiveTab("whiteboard")}
          >
            🎨 Whiteboard
          </button>
        </div>

        <button className="join-btn" onClick={() => handleJoin(activeTab)}>
          {roomId ? "Join Room →" : "Create New Room →"}
        </button>
      </div>

      {(rooms.documents.length > 0 || rooms.whiteboards.length > 0) && (
        <div className="recent-rooms">
          <h3>Recent Rooms</h3>
          <div className="rooms-grid">
            {rooms.documents.map((doc) => (
              <div
                key={doc.roomId}
                className="room-card doc-card"
                onClick={() => handleJoin("document", doc.roomId)}
              >
                <span className="room-icon">📄</span>
                <div>
                  <div className="room-title">{doc.title || "Untitled Document"}</div>
                  <div className="room-id">{doc.roomId.slice(0, 8)}...</div>
                </div>
              </div>
            ))}
            {rooms.whiteboards.map((wb) => (
              <div
                key={wb.roomId}
                className="room-card wb-card"
                onClick={() => handleJoin("whiteboard", wb.roomId)}
              >
                <span className="room-icon">🎨</span>
                <div>
                  <div className="room-title">{wb.title || "Untitled Whiteboard"}</div>
                  <div className="room-id">{wb.roomId.slice(0, 8)}...</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;
