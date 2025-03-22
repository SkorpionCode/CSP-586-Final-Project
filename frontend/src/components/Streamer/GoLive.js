// src/components/Streamer/GoLive.js
import React from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

function GoLive() {
  const { streamId } = useParams();
  const token = localStorage.getItem('token');
  const history = useNavigate();

  const handleGoLive = async () => {
    try {
      await axios.post(`http://localhost:5000/stream/go-live/${streamId}`, {}, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      alert('Stream is now live!');
      history.push(`/stream/${streamId}`);
    } catch (error) {
      alert('Error going live');
    }
  };

  return (
    <div>
      <h2>Go Live</h2>
      <button onClick={handleGoLive}>Go Live</button>
    </div>
  );
}

export default GoLive;