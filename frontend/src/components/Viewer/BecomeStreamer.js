// src/components/Viewer/BecomeStreamer.js
import React from 'react';
import { Container, Box, Typography, Button } from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function BecomeStreamer() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const username = localStorage.getItem('username');

  const handleBecomeStreamer = async () => {
    try {
      // Pass null as payload so no empty JSON is sent.
      await axios.post('http://localhost:5000/become-streamer', {username}, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      alert('You are now a streamer!');
      navigate('/stream-setup');
    } catch (error) {
      console.error('Error becoming a streamer:', error);
      alert('Error: ' + (error.response?.data?.msg || error.message));
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2,
          p: 2,
          bgcolor: '#ffffff',
          borderRadius: 2,
          boxShadow: 2,
        }}
      >
        <Typography variant="h5" sx={{ color: '#0D47A1' }}>
          Become a Streamer
        </Typography>
        <Button
          variant="contained"
          onClick={handleBecomeStreamer}
          sx={{
            backgroundColor: '#0D47A1',
            color: '#fff',
            '&:hover': { backgroundColor: '#0A356E' },
          }}
        >
          Become Streamer
        </Button>
      </Box>
    </Container>
  );
}

export default BecomeStreamer;