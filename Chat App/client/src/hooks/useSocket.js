import { useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';

const SERVER = 'http://localhost:5000';

export const useSocket = (user) => {
  const socketRef  = useRef(null);
  const [messages, setMessages]   = useState([]);
  const [isTyping, setIsTyping]   = useState(false);
  const [typingUser, setTypingUser] = useState('');
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    socketRef.current = io(SERVER);
    const socket = socketRef.current;

    socket.on('connect',    () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));

    // Load history from MongoDB when joining a room
    socket.on('chat_history', (history) => {
      setMessages(history);
    });

    // New live message
    socket.on('receive_message', (data) => {
      setMessages(prev => [...prev, data]);
    });

    // User joined notification
    socket.on('user_joined', ({ user: joinedUser, room }) => {
      setMessages(prev => [...prev, {
        _id: Date.now(),
        system: true,
        message: `${joinedUser} joined #${room}`,
        time: new Date()
      }]);
    });

    // Typing indicators
    socket.on('typing',      ({ user: u }) => { setIsTyping(true);  setTypingUser(u); });
    socket.on('stop_typing', ()            => { setIsTyping(false); setTypingUser(''); });

    return () => socket.disconnect();
  }, []);

  const joinRoom = useCallback((room) => {
    setMessages([]); // clear before history loads
    socketRef.current.emit('join_room', { room, user });
  }, [user]);

  const sendMessage = useCallback((room, message) => {
    socketRef.current.emit('send_message', { room, message, sender: user });
  }, [user]);

  const emitTyping     = useCallback((room) => socketRef.current.emit('typing',      { room, user }), [user]);
  const emitStopTyping = useCallback((room) => socketRef.current.emit('stop_typing', { room }),       [user]);

  return { messages, isTyping, typingUser, connected, joinRoom, sendMessage, emitTyping, emitStopTyping };
};