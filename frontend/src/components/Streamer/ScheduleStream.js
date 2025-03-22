// src/components/Streamer/ScheduleStream.js
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function ScheduleStream() {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState('');
  const [schedule, setSchedule] = useState('');
  const token = localStorage.getItem('token');
  const history = useNavigate();

  const handleSchedule = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/stream/schedule', 
        { title, category, tags, schedule },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      alert('Stream scheduled successfully!');
      history.push(`/stream/${response.data.stream_id}`);
    } catch (error) {
      alert('Error scheduling stream');
    }
  };

  return (
    <div>
      <h2>Schedule Stream</h2>
      <form onSubmit={handleSchedule}>
        <label>
          Stream Title:
          <input 
            type="text" 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
            required 
          />
        </label>
        <br />
        <label>
          Category:
          <input 
            type="text" 
            value={category} 
            onChange={(e) => setCategory(e.target.value)} 
          />
        </label>
        <br />
        <label>
          Tags:
          <input 
            type="text" 
            value={tags} 
            onChange={(e) => setTags(e.target.value)} 
          />
        </label>
        <br />
        <label>
          Schedule (ISO format):
          <input 
            type="text" 
            value={schedule} 
            onChange={(e) => setSchedule(e.target.value)} 
          />
        </label>
        <br />
        <button type="submit">Schedule Stream</button>
      </form>
    </div>
  );
}

export default ScheduleStream;