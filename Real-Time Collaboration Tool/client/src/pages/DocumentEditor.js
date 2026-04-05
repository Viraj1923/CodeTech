import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { useSocket } from "../context/SocketContext";
import UserAvatars from "../components/UserAvatars";
import ChatSidebar from "../components/ChatSidebar";

const DocumentEditor = () => {
  const { roomId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { socket } = useSocket();

  const userName = searchParams.get("name") || localStorage.getItem("collabUserName") || "Anonymous";

  const [content, setContent] = useState("");
  const [title, setTitle] = useState("Untitled Document");
  const [users, setUsers] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [saveStatus, setSaveStatus] = useState("saved");
  const [isCopied, setIsCopied] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const textareaRef = useRef(null);
  const saveTimerRef = useRef(null);
  const isRemoteUpdate = useRef(false);
  const chatOpenRef = useRef(chatOpen);
  chatOpenRef.current = chatOpen;

  const myColor = users.find((u) => u.name === userName)?.color || "#6c63ff";

  useEffect(() => {
    if (!socket) return;

    socket.emit("join-document", { roomId, userName });
    setIsConnected(true);

    socket.on("document-state", ({ content: c, title: t }) => {
      setContent(c);
      setTitle(t);
    });

    socket.on("document-update", ({ content: c }) => {
      isRemoteUpdate.current = true;
      setContent(c);
      setTimeout(() => { isRemoteUpdate.current = false; }, 10);
    });

    socket.on("document-title-update", ({ title: t }) => setTitle(t));
    socket.on("users-update", (u) => setUsers(u));

    socket.on("chat-message", (msg) => {
      if (!chatOpenRef.current && msg.userName !== userName) {
        setUnreadCount((n) => n + 1);
      }
    });

    return () => {
      socket.off("document-state");
      socket.off("document-update");
      socket.off("document-title-update");
      socket.off("users-update");
      socket.off("chat-message");
    };
  }, [socket, roomId, userName]);

  const handleContentChange = useCallback((e) => {
    if (isRemoteUpdate.current) return;
    const newContent = e.target.value;
    setContent(newContent);
    setSaveStatus("unsaved");
    socket?.emit("document-change", { roomId, content: newContent });
    clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => setSaveStatus("saved"), 1000);
  }, [socket, roomId]);

  const handleTitleChange = (e) => {
    const t = e.target.value;
    setTitle(t);
    socket?.emit("document-title-change", { roomId, title: t });
  };

  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const downloadDoc = () => {
    const blob = new Blob(
      [`${title}\n${"=".repeat(title.length)}\n\n${content}`],
      { type: "text/plain;charset=utf-8" }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title.replace(/[^a-z0-9]/gi, "_") || "document"}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const openChat = () => {
    setChatOpen(true);
    setUnreadCount(0);
  };

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;

  return (
    <div className="editor-page">
      <div className="editor-topbar">
        <button className="back-btn" onClick={() => navigate("/")}>← Home</button>
        <div className="title-area">
          <input
            className="doc-title-input"
            value={title}
            onChange={handleTitleChange}
            placeholder="Untitled Document"
          />
        </div>
        <div className="topbar-right">
          <div className={`save-status ${saveStatus}`}>
            {saveStatus === "saved" ? "✓ Saved" : "● Unsaved"}
          </div>
          <div className={`conn-badge ${isConnected ? "online" : "offline"}`}>
            <span className="conn-dot" />{isConnected ? "Live" : "Offline"}
          </div>
          <UserAvatars users={users} />
          <button className="icon-btn" onClick={downloadDoc} title="Download .txt">⬇</button>
          <button className="icon-btn" onClick={openChat} title="Chat" style={{ position: "relative" }}>
            💬{unreadCount > 0 && <span className="unread-badge">{unreadCount}</span>}
          </button>
          <button className="room-id-btn" onClick={copyRoomId}>
            {isCopied ? "✓ Copied!" : `🔗 ${roomId.slice(0, 6)}...`}
          </button>
        </div>
      </div>

      <div className="editor-with-chat">
        <div className="editor-body">
          <div className="editor-paper">
            <textarea
              ref={textareaRef}
              className="doc-textarea"
              value={content}
              onChange={handleContentChange}
              placeholder="Start typing... your collaborators will see changes in real time ✨"
              spellCheck={true}
            />
          </div>
        </div>
        <ChatSidebar
          roomId={roomId}
          userName={userName}
          userColor={myColor}
          isOpen={chatOpen}
          onClose={() => setChatOpen(false)}
        />
      </div>

      <div className="editor-statusbar">
        <span>{wordCount} words</span>
        <span>{content.length} characters</span>
        <span>{users.length} collaborator{users.length !== 1 ? "s" : ""} online</span>
        <span className="room-id-display">Room: {roomId}</span>
      </div>
    </div>
  );
};

export default DocumentEditor;
