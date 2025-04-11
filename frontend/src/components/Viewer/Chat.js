// src/components/Viewer/Chat.js
import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

// Create a socket connection instance (you can also scope this inside useEffect)
const socket = io('http://localhost:5000');

function Chat({ streamId: propStreamId }) {
  // Try to retrieve streamId from props; if not, use URL param.
  const { streamId: paramStreamId } = useParams();
  const streamId = propStreamId || paramStreamId;

  // Check if streamId is defined; if not, log an error.
  if (!streamId) {
    console.error("Chat component: streamId is undefined. Ensure it is passed correctly.");
  }
  
  const [messages, setMessages] = useState([]); // Persistent chat history
  const [message, setMessage] = useState('');
  // Assume username is stored in localStorage
  const username = localStorage.getItem('username') || 'Anonymous';
  const token = localStorage.getItem('token');
  
  // Load chat history and set up socket listeners on mount.
  useEffect(() => {
    if (!streamId) return; // Exit early if streamId is not defined

    // Fetch persistent chat history from the backend.
    axios
      .get(`http://localhost:5000/chat/${streamId}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      })
      .then(response => {
        console.log('Chat history:', response.data);
        setMessages(response.data);
      })
      .catch(error =>
        console.error('Error fetching chat history:', error)
      );

    // Join the chat room.
    const room = 'stream_' + streamId;
    socket.emit('join', { room });

    // Listen for new chat messages from the backend.
    socket.on('chat', data => {
      setMessages(prevMessages => [...prevMessages, data]);
    });

    // Cleanup on unmount.
    return () => {
      socket.emit('leave', { room });
      socket.off('chat'); // Remove event listener to prevent duplicates.
    };
  }, [streamId, token]);

  const handleSend = e => {
    e.preventDefault();
    if (!streamId) {
      console.error("Cannot send message because streamId is undefined.");
      return;
    }
    const room = 'stream_' + streamId;
    // Emit the chat event, sending message and username.
    socket.emit('chat', { room, message, username });
    setMessage('');
  };

  const navigate = useNavigate();

  // Optional: A back button to go to the stream page.
  const handleBack = () => {
    navigate(`/stream/${streamId}`);
  };

  return (
    <div>
      <button onClick={handleBack} style={{ marginBottom: '10px' }}>
        ← Back to Stream
      </button>
      <h2>Live Chat</h2>
      <div
        style={{
          border: '1px solid #ccc',
          padding: '10px',
          height: '300px',
          overflowY: 'scroll',
        }}
      >
        {messages.map((msg, index) => (
          <div key={index}>
            <strong>{msg.username ? msg.username : username}:</strong> {msg.message}{' '}
            <em>{new Date(msg.timestamp).toLocaleTimeString()}</em>
          </div>
        ))}
      </div>
      <form onSubmit={handleSend}>
        <input
          type="text"
          value={message}
          onChange={e => setMessage(e.target.value)}
          placeholder="Enter your message"
          required
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}

export default Chat;