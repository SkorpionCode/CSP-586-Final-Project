// src/components/Streamer/ScheduleStream.js
import React, { useState } from 'react';
import { Container, Box, TextField, Button, Typography, Card, CardContent } from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function ScheduleStream() {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState('');
  const [schedule, setSchedule] = useState('');
  const token = localStorage.getItem('token');
  const navigate = useNavigate();
  const username = localStorage.getItem('username')

  const handleSchedule = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        'http://localhost:5000/stream/schedule',
        { title, category, tags, schedule, username:username },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      alert('Stream scheduled successfully!');
      navigate(`/stream/${response.data.stream_id}`);
    } catch (error) {
      alert('Error scheduling stream: ' + (error.response?.data?.msg || error.message));
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Card>
        <CardContent>
          <Typography variant="h4" sx={{ mb: 2, color: '#0D47A1' }}>
            Schedule Stream
          </Typography>
          <Box component="form" onSubmit={handleSchedule} noValidate>
            <TextField
              label="Stream Title"
              variant="outlined"
              fullWidth
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              sx={{ mb: 2 }}
            />
            <TextField
              label="Category"
              variant="outlined"
              fullWidth
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              sx={{ mb: 2 }}
            />
            <TextField
              label="Tags"
              variant="outlined"
              fullWidth
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              sx={{ mb: 2 }}
            />
            
            <Button type="submit" fullWidth variant="contained"
              sx={{ backgroundColor: '#0D47A1', color: '#fff', '&:hover': { backgroundColor: '#0A356E' } }}
            >
              Schedule Stream
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
}

export default ScheduleStream;