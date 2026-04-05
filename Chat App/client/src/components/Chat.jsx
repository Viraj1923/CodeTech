import { useEffect, useRef, useState } from 'react';
import MessageInput from './MessageInput';

export default function Chat({ messages, isTyping, typingUser, currentRoom, currentUser, onSend, onTyping, onStopTyping }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="chat-main">
      <div className="chat-header">
        <span className="room-name"># {currentRoom}</span>
      </div>

      <div className="messages-list">
        {messages.map((m, i) =>
          m.system ? (
            <div key={m._id || i} className="system-msg">{m.message}</div>
          ) : (
            <div key={m._id || i} className={`msg-row ${m.sender === currentUser ? 'own' : ''}`}>
              <div className="avatar">{m.sender?.slice(0,2).toUpperCase()}</div>
              <div className="bubble-wrap">
                {m.sender !== currentUser && <span className="sender-name">{m.sender}</span>}
                <div className="bubble">{m.message}</div>
                <span className="msg-time">
                  {new Date(m.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          )
        )}
        <div ref={bottomRef} />
      </div>

      {isTyping && (
        <div className="typing-indicator">{typingUser} is typing...</div>
      )}

      <MessageInput
        onSend={onSend}
        onTyping={onTyping}
        onStopTyping={onStopTyping}
        room={currentRoom}
      />
    </div>
  );
}