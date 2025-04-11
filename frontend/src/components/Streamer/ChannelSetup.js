// src/components/Streamer/ChannelSetup.js
import React, { useState } from 'react';
import { Container, Card, CardContent, Typography, Box, TextField, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function ChannelSetup() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  // Local state for stream configuration.
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState('');
  const [schedule, setSchedule] = useState('');
  const [channelInfo, setChannelInfo] = useState('');
  const [streamUrl, setStreamUrl] = useState(''); // Optional pre-configured stream URL
  const username = localStorage.getItem('username');

  const handleSetup = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        'http://localhost:5000/stream/setup',
        {
          title,
          category,
          tags,
          schedule,           // expects ISO format string (e.g., "2023-08-26T14:30:00")
          channel_info: channelInfo,
          stream_url: streamUrl,
          username: username
        },
        { headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } }
      );
      alert('Stream setup completed!');
      navigate(`/go-live/${response.data.stream_id}`);
    } catch (error) {
      alert('Error setting up stream: ' + (error.response?.data?.msg || error.message));
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Card>
        <CardContent>
          <Typography variant="h4" sx={{ mb: 2, color: '#0D47A1' }}>
            Channel Setup
          </Typography>
          <Box component="form" onSubmit={handleSetup} noValidate>
            <TextField
              label="Stream Title"
              fullWidth
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              sx={{ mb: 2 }}
            />
            <TextField
              label="Category"
              fullWidth
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              sx={{ mb: 2 }}
            />
            <TextField
              label="Tags"
              fullWidth
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              sx={{ mb: 2 }}
            />
            <TextField
              label="Channel Info"
              fullWidth
              multiline
              rows={3}
              value={channelInfo}
              onChange={(e) => setChannelInfo(e.target.value)}
              sx={{ mb: 2 }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{
                backgroundColor: '#0D47A1',
                color: '#fff',
                '&:hover': { backgroundColor: '#0A356E' },
                mt: 1,
              }}
            >
              Setup Stream
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
}

export default ChannelSetup;