// src/components/Viewer/Chat.js
import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

// Create a socket connection instance.
const socket = io('http://localhost:5000');

function Chat() {
  const { streamId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]); // Persistent chat history
  const [message, setMessage] = useState('');
  const username = localStorage.getItem('username') || 'Anonymous';
  const token = localStorage.getItem('token');

  // Load persistent chat history and set up the socket listener on mount.
  useEffect(() => {
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

    // Clean up on component unmount.
    return () => {
      socket.emit('leave', { room });
      socket.off('chat'); // Remove event listener to prevent duplicates.
    };
  }, [streamId, token]);

  // Function to handle sending a message.
  const handleSend = e => {
    e.preventDefault();
    const room = 'stream_' + streamId;
    // Emit the chat event with the room, message, and username.
    socket.emit('chat', { room, message, username });
    setMessage('');
  };

  // Function to handle going back to the associated stream.
  const handleBack = () => {
    navigate(`/stream/${streamId}`);
  };

  return (
    <div>
      {/* Back Button */}
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
            <strong>{msg.username || username}:</strong> {msg.message}{' '}
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