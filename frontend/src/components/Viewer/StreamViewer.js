// src/components/Viewer/StreamViewer.js
import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import Hls from 'hls.js';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Divider,
} from '@mui/material';
import Chat from './Chat';

function StreamViewer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [stream, setStream] = useState(null);
  const videoRef = useRef(null);

  // Fetch stream data from backend
  useEffect(() => {
    axios
      .get(`http://localhost:5000/stream/${id}`)
      .then((response) => {
        setStream(response.data);
      })
      .catch((error) => console.error('Error fetching stream:', error));
  }, [id]);

  // Setup HLS playback on the video element when stream is live
  useEffect(() => {
    if (stream && stream.is_live && stream.stream_url && videoRef.current) {
      if (Hls.isSupported()) {
        const hls = new Hls();
        hls.loadSource(stream.stream_url);
        hls.attachMedia(videoRef.current);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          videoRef.current.play().catch((err) => {
            console.error('Playback error:', err);
          });
        });
        hls.on(Hls.Events.ERROR, (event, data) => {
          console.error('HLS error:', data);
        });
      } else if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
        videoRef.current.src = stream.stream_url;
        videoRef.current.addEventListener('loadedmetadata', () => {
          videoRef.current.play().catch((err) => {
            console.error('Playback error:', err);
          });
        });
      } else {
        console.error('HLS is not supported in this browser.');
      }
    }
  }, [stream]);

  return (
    <Container maxWidth="md" sx={{ marginTop: 4 }}>
      <Button variant="outlined" onClick={() => navigate(-1)} sx={{ marginBottom: 2 }}>
        ← Back
      </Button>
      <Card sx={{ marginBottom: 4 }}>
        <CardContent>
          <Typography variant="h4" sx={{ color: '#0D47A1', marginBottom: 2 }}>
            {stream ? stream.title : 'Loading...'}
          </Typography>
          <Typography variant="body1">
            Category: {stream && stream.category ? stream.category : 'N/A'}
          </Typography>
          <Typography variant="body1">
            Tags: {stream && stream.tags ? stream.tags : 'N/A'}
          </Typography>
          <Typography
            variant="body1"
            sx={{
              marginBottom: 2,
              color: stream && stream.is_live ? 'error.main' : 'text.secondary',
            }}
          >
            {stream && stream.is_live ? 'Live Now!' : 'Offline'}
          </Typography>
          {stream && stream.is_live && stream.stream_url ? (
            <Box
              sx={{
                width: '100%',
                height: '480px',
                backgroundColor: '#000',
              }}
            >
              <video
                ref={videoRef}
                controls
                autoPlay
                muted
                style={{ width: '100%', height: '100%' }}
              >
                Your browser does not support the video tag.
              </video>
            </Box>
          ) : (
            <Typography variant="body2">
              The stream is not live at the moment.
            </Typography>
          )}
        </CardContent>
      </Card>
      <Divider sx={{ marginY: 2 }} />
      {/* Embed Chat component below the stream */}
      <Chat streamId={id} />
    </Container>
  );
}

export default StreamViewer;