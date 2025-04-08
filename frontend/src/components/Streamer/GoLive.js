// src/components/Streamer/GoLive.js
import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

function GoLive() {
  const { streamId } = useParams();
  const videoRef = useRef(null);
  const [streaming, setStreaming] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const username = localStorage.getItem('username')

  const rtmpUrl = `rtmp://localhost/live`;
  const streamKey = `stream_${streamId}`;

  const handleStartStreaming = async () => {
    // The streamer must configure OBS to stream to `rtmpUrl` with the given stream key.
    // Once OBS is streaming, trigger the backend to mark the stream as live.
    try {
      const response = await axios.post(`http://localhost:5000/stream/go-live/${streamId}`,
        {username},
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      setStreaming(true);
      alert(`Your stream is now live! Please configure OBS with:
      RTMP URL: ${rtmpUrl}
      Stream Key: ${streamKey}`);
      navigate(`/stream/${streamId}`);
    } catch (error) {
      console.error('Error starting live stream:', error);
      alert('Error starting stream: ' + (error.response?.data?.msg || error.message));
    }
  };

  return (
    <div>
      <h2>Go Live</h2>
      <p>Configure OBS as follows:</p>
      <p>RTMP URL: <strong>{rtmpUrl}</strong></p>
      <p>Stream Key: <strong>{streamKey}</strong></p>
      <button onClick={handleStartStreaming} disabled={streaming}>
        {streaming ? 'Streaming...' : 'Start Live Stream'}
      </button>
    </div>
  );
}

export default GoLive;
