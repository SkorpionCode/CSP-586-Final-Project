// src/components/Viewer/Chat.js
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

function Chat() {
  const { streamId } = useParams();
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const token = localStorage.getItem('token');
  const username = localStorage.getItem('username');

  const fetchMessages = useCallback(() => {
    axios.get(`http://localhost:5000/chat/${streamId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(response => setMessages(response.data))
    .catch(error => console.error('Error fetching chat messages:', error));
  }, [streamId, token]);

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [fetchMessages]);

  const handleSend = (e) => {
    e.preventDefault();
    axios.post(`http://localhost:5000/chat/${streamId}`, { username ,message }, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(() => {
      setMessage('');
      fetchMessages();
    })
    .catch(error => console.error('Error sending message:', error));
  };

  return (
    <div>
      <h2>Live Chat</h2>
      <div style={{ border: '1px solid #ccc', padding: '10px', height: '300px', overflowY: 'scroll' }}>
        {messages.map((msg, index) => (
          <div key={index}>
            <strong>{msg.username}:</strong> {msg.message} <em>{new Date(msg.timestamp).toLocaleTimeString()}</em>
          </div>
        ))}
      </div>
      <form onSubmit={handleSend}>
        <input 
          type="text" 
          value={message} 
          onChange={(e) => setMessage(e.target.value)} 
          placeholder="Enter your message" 
          required 
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}

export default Chat;