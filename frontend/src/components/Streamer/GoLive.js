// src/components/Streamer/GoLive.js
import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Card, CardContent, Typography, Box, Button, Divider } from '@mui/material';

function GoLive() {
  const { streamId } = useParams();
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const [streaming, setStreaming] = useState(false);
  const [streamData, setStreamData] = useState(null);
  const token = localStorage.getItem('token');
  const username = localStorage.getItem('username');

  // Fetch current stream state on mount.
  useEffect(() => {
    const fetchStreamStatus = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/stream/${streamId}`);
        setStreamData(response.data);
        if (response.data.is_live && response.data.stream_url) {
          setStreaming(true);
        } else {
          setStreaming(false);
        }
      } catch (error) {
        console.error("Error fetching stream status:", error);
      }
    };
    fetchStreamStatus();
  }, [streamId]);

  // RTMP configuration for OBS (for development, using localhost)
  const rtmpUrl = "rtmp://localhost/live";
  const streamKey = `stream_${streamId}`;

  // Handle starting the stream.
  const handleStartStreaming = async () => {
    try {
      await axios.post(
        `http://localhost:5000/stream/go-live/${streamId}`,
        {username},
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      setStreaming(true);
      alert(`Your stream is now live!
Configure OBS with:
RTMP URL: ${rtmpUrl}
Stream Key: ${streamKey}`);
      navigate(`/stream/${streamId}`);
    } catch (error) {
      console.error("Error starting live stream:", error);
      alert("Error starting stream: " + (error.response?.data?.msg || error.message));
    }
  };

  // Handle stopping the stream.
  const handleStopStreaming = async () => {
    try {
      await axios.post(
        `http://localhost:5000/stream/stop/${streamId}`,
        {username},
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      setStreaming(false);
      alert("Your stream has ended.");
    } catch (error) {
      console.error("Error stopping live stream:", error);
      alert("Error stopping stream: " + (error.response?.data?.msg || error.message));
    }
  };

  return (
    <Container maxWidth="sm" sx={{ marginTop: 4 }}>
      <Card>
        <CardContent>
          <Typography variant="h4" sx={{ color: '#0D47A1', marginBottom: 2 }}>
            Go Live
          </Typography>
          <Divider sx={{ marginY: 2 }} />
          <Typography variant="body1" sx={{ marginBottom: 1 }}>
            Configure OBS as follows:
          </Typography>
          <Typography variant="body2" sx={{ color: '#0D47A1' }}>
            RTMP URL: <strong>{rtmpUrl}</strong>
          </Typography>
          <Typography variant="body2" sx={{ color: '#0D47A1', marginBottom: 2 }}>
            Stream Key: <strong>{streamKey}</strong>
          </Typography>
          {streaming ? (
            <Button
              variant="contained"
              color="error"
              fullWidth
              onClick={handleStopStreaming}
            >
              Stop Stream
            </Button>
          ) : (
            <Button
              variant="contained"
              fullWidth
              onClick={handleStartStreaming}
              sx={{ backgroundColor: "#0D47A1", color: "#fff", "&:hover": { backgroundColor: "#0A356E" } }}
            >
              Start Live Stream
            </Button>
          )}
        </CardContent>
      </Card>
    </Container>
  );
}

export default GoLive;