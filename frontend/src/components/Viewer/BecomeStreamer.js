// src/components/Viewer/BecomeStreamer.js
import React from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function BecomeStreamer() {
  const token = localStorage.getItem('token');
  const history = useNavigate();
  const username = localStorage.getItem('username');

  const handleBecomeStreamer = async () => {
    try {
      await axios.post('http://localhost:5000/become-streamer', {username}, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      alert('You are now a streamer!');
      localStorage.setItem('role', 'streamer')
    } catch (error) {
      alert('Error becoming a streamer');
    }
  };

  return (
    <div>
      <h2>Become a Streamer</h2>
      <button onClick={handleBecomeStreamer}>Become Streamer</button>
    </div>
  );
}

export default BecomeStreamer;