import { useState } from 'react';
import { useSocket } from './hooks/useSocket';
import Sidebar from './components/Sidebar';
import Chat    from './components/Chat';

const ROOMS = ['general', 'dev', 'random'];

export default function App() {
  const [user, setUser]       = useState('');
  const [joined, setJoined]   = useState(false);
  const [room, setRoom]       = useState('general');

  const { messages, isTyping, typingUser, connected,
          joinRoom, sendMessage, emitTyping, emitStopTyping } = useSocket(user);

  const handleJoin = (e) => {
    e.preventDefault();
    if (!user.trim()) return;
    setJoined(true);
    joinRoom('general');
  };

  const handleRoomSwitch = (newRoom) => {
    setRoom(newRoom);
    joinRoom(newRoom);
  };

  if (!joined) return (
    <div className="login-screen">
      <form onSubmit={handleJoin}>
        <h2>Join ChatApp</h2>
        <input
          value={user}
          onChange={e => setUser(e.target.value)}
          placeholder="Enter your username"
          required
        />
        <button type="submit">Join</button>
      </form>
    </div>
  );

  return (
    <div className="app-layout">
      <Sidebar
        rooms={ROOMS}
        currentRoom={room}
        onSwitch={handleRoomSwitch}
        user={user}
        connected={connected}
      />
      <Chat
        messages={messages}
        isTyping={isTyping}
        typingUser={typingUser}
        currentRoom={room}
        currentUser={user}
        onSend={(msg) => sendMessage(room, msg)}
        onTyping={() => emitTyping(room)}
        onStopTyping={() => emitStopTyping(room)}
      />
    </div>
  );
}