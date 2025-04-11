// src/components/Streamer/ChannelSetup.js
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function ChannelSetup() {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState('');
  const [schedule, setSchedule] = useState('');
  const [channelInfo, setChannelInfo] = useState('');
  const [streamUrl, setStreamUrl] = useState('');
  const token = localStorage.getItem('token');
  const history = useNavigate();
  const username = localStorage.getItem('username')

  const handleSetup = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/stream/setup', 
        { title, category, tags, schedule, channel_info: channelInfo, username: username, stream_url: streamUrl },
        { headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } }
      );
      alert('Stream setup completed!');
    } catch (error) {
      alert('Error setting up stream');
    }
  };

  return (
    <div>
      <h2>Channel Setup</h2>
      <form onSubmit={handleSetup}>
        <label>
          Stream Title:
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
        </label>
        <br />
        <label>
          Category:
          <input type="text" value={category} onChange={(e) => setCategory(e.target.value)} />
        </label>
        <br />
        <label>
          Tags:
          <input type="text" value={tags} onChange={(e) => setTags(e.target.value)} />
        </label>
        <br />
        <label>
          Schedule (ISO format):
          <input type="text" value={schedule} onChange={(e) => setSchedule(e.target.value)} />
        </label>
        <br />
        <label>
          Channel Info:
          <textarea value={channelInfo} onChange={(e) => setChannelInfo(e.target.value)} />
        </label>
        <br />
        <label>
          Pre-configured Stream URL (optional):
          <input type="text" value={streamUrl} onChange={(e) => setStreamUrl(e.target.value)} />
        </label>
        <br />
        <button type="submit">Setup Stream</button>
      </form>
    </div>
  );
}

export default ChannelSetup;