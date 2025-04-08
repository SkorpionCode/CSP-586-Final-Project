// src/components/Streamer/GoLive.js
import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

function GoLive() {
  const { streamId } = useParams();
  const videoRef = useRef(null);
  const [streaming, setStreaming] = useState(false);
  const [streamData, setStreamData] = useState(null);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const username = localStorage.getItem('username')

  const rtmpUrl = `rtmp://localhost/live`;
  const streamKey = `stream_${streamId}`;

  useEffect(() => {
    const fetchStreamStatus = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/stream/${streamId}`);
        setStreamData(response.data);
        // Set streaming to true if the stream is live.
        if (response.data.is_live && response.data.stream_url) {
          setStreaming(true);
        } else {
          setStreaming(false);
        }
      } catch (error) {
        console.error('Error fetching stream status:', error);
      }
    };

    fetchStreamStatus();
  }, [streamId]);

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

  const handleStopStreaming = async () => {
    try {
      const response = await axios.post(
        `http://localhost:5000/stream/stop/${streamId}`,
        {username}, // No payload needed
        {
          headers: { "Authorization": `Bearer ${token}` }
        }
      );
      setStreaming(false);
      alert("Your stream has ended.");
      // Optionally, navigate back to a dashboard or refresh the component.
    } catch (error) {
      console.error("Error stopping live stream:", error);
      alert("Error stopping stream: " + (error.response?.data?.msg || error.message));
    }
  };

  return (
    <div>
      <h2>Go Live</h2>
      <p>Configure OBS as follows:</p>
      <p>RTMP URL: <strong>{rtmpUrl}</strong></p>
      <p>Stream Key: <strong>{streamKey}</strong></p>
      {streaming ? (
        <button onClick={handleStopStreaming}>Stop Stream</button>
      ) : (
        <button onClick={handleStartStreaming}>Start Live Stream</button>
      )}
    </div>
  );
}

export default GoLive;
