import { useState, useRef } from 'react';

export default function MessageInput({ onSend, onTyping, onStopTyping }) {
  const [text, setText]       = useState('');
  const typingTimer           = useRef(null);

  const handleChange = (e) => {
    setText(e.target.value);
    onTyping();
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(onStopTyping, 1000);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    onSend(text.trim());
    setText('');
    clearTimeout(typingTimer.current);
    onStopTyping();
  };

  return (
    <form className="input-area" onSubmit={handleSubmit}>
      <input
        value={text}
        onChange={handleChange}
        placeholder="Type a message..."
      />
      <button type="submit">Send</button>
    </form>
  );
}