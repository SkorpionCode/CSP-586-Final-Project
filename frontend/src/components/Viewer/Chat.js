// src/components/Viewer/Chat.js
import React, { useState, useEffect } from 'react';
import { Container, Box, Typography, TextField, Button, Card, CardContent } from '@mui/material';
import io from 'socket.io-client';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

// Create the socket connection.
const socket = io('http://localhost:5000');

function Chat({ streamId: propStreamId }) {
  const { streamId: paramStreamId } = useParams();
  // Use streamId from props if given; otherwise, use URL parameter.
  const streamId = propStreamId || paramStreamId;
  const [messages, setMessages] = useState([]); // Persistent chat history.
  const [message, setMessage] = useState('');
  const username = localStorage.getItem('username') || 'Anonymous';
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  useEffect(() => {
    if (!streamId) {
      console.error("Chat component: streamId is undefined.");
      return;
    }
    // Fetch persistent chat history.
    axios
      .get(`http://localhost:5000/chat/${streamId}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      })
      .then((response) => {
        setMessages(response.data);
      })
      .catch((error) => console.error("Error fetching chat history:", error));

    // Join the chat room.
    const room = `stream_${streamId}`;
    socket.emit('join', { room });
    // Listen for new messages.
    socket.on('chat', (data) => {
      setMessages((prev) => [...prev, data]);
    });

    // Cleanup on unmount.
    return () => {
      socket.emit('leave', { room });
      socket.off('chat');
    };
  }, [streamId, token]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!streamId) {
      console.error("Cannot send message because streamId is undefined.");
      return;
    }
    const room = `stream_${streamId}`;
    socket.emit('chat', { room, message, username });
    setMessage('');
  };

  const handleBack = () => {
    navigate(`/stream/${streamId}`);
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Typography variant="h5" sx={{ mb: 2, color: '#0D47A1' }}>
        Live Chat
      </Typography>
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Box
            sx={{
              border: '1px solid #ccc',
              p: 2,
              height: 300,
              overflowY: 'scroll',
            }}
          >
            {messages.map((msg, idx) => (
              <Box key={idx} sx={{ mb: 1 }}>
                <Typography variant="subtitle2">
                  {msg.username ? msg.username : username}:{' '}
                  <em>{new Date(msg.timestamp).toLocaleTimeString()}</em>
                </Typography>
                <Typography variant="body2">{msg.message}</Typography>
              </Box>
            ))}
          </Box>
        </CardContent>
      </Card>
      <Box component="form" onSubmit={handleSend} sx={{ display: 'flex', gap: 1 }}>
        <TextField
          fullWidth
          placeholder="Enter your message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
        />
        <Button type="submit" variant="contained" sx={{ backgroundColor: '#0D47A1', color: '#fff', '&:hover': { backgroundColor: '#0A356E' } }}>
          Send
        </Button>
      </Box>
    </Container>
  );
}

export default Chat;