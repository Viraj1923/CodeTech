import React, { useState, useEffect, useRef } from "react";
import { useSocket } from "../context/SocketContext";

const ChatSidebar = ({ roomId, userName, userColor, isOpen, onClose }) => {
  const { socket } = useSocket();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    if (!socket) return;

    socket.on("chat-message", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    socket.on("chat-history", (history) => {
      setMessages(history);
    });

    // Request history on mount
    socket.emit("get-chat-history", { roomId });

    return () => {
      socket.off("chat-message");
      socket.off("chat-history");
    };
  }, [socket, roomId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    const text = input.trim();
    if (!text || !socket) return;

    const msg = {
      roomId,
      text,
      userName,
      color: userColor || "#6c63ff",
      timestamp: new Date().toISOString(),
    };

    socket.emit("chat-message", msg);
    setInput("");
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (iso) => {
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  if (!isOpen) return null;

  return (
    <div className="chat-sidebar">
      <div className="chat-header">
        <span>💬 Room Chat</span>
        <button className="chat-close" onClick={onClose}>✕</button>
      </div>

      <div className="chat-messages">
        {messages.length === 0 && (
          <div className="chat-empty">No messages yet. Say hello! 👋</div>
        )}
        {messages.map((msg, i) => {
          const isMe = msg.userName === userName;
          const prevMsg = messages[i - 1];
          const showName = !prevMsg || prevMsg.userName !== msg.userName;
          return (
            <div key={i} className={`chat-msg ${isMe ? "me" : "them"}`}>
              {showName && !isMe && (
                <div className="msg-name" style={{ color: msg.color }}>
                  {msg.userName}
                </div>
              )}
              <div className="msg-bubble" style={isMe ? { background: msg.color } : {}}>
                {msg.text}
              </div>
              <div className="msg-time">{formatTime(msg.timestamp)}</div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <div className="chat-input-row">
        <textarea
          className="chat-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Type a message... (Enter to send)"
          rows={2}
        />
        <button className="chat-send" onClick={sendMessage}>➤</button>
      </div>
    </div>
  );
};

export default ChatSidebar;
