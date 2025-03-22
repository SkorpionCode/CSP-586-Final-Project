// src/components/Viewer/ReportContent.js
import React, { useState } from 'react';
import axios from 'axios';

function ReportContent() {
  const [streamId, setStreamId] = useState('');
  const [description, setDescription] = useState('');
  const token = localStorage.getItem('token');

  const handleReport = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/report', { stream_id: streamId, description }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      alert('Report submitted!');
      setStreamId('');
      setDescription('');
    } catch (error) {
      alert('Error submitting report');
    }
  };

  return (
    <div>
      <h2>Report Content</h2>
      <form onSubmit={handleReport}>
        <label>
          Stream ID:
          <input 
            type="text" 
            value={streamId} 
            onChange={(e) => setStreamId(e.target.value)} 
            required 
          />
        </label>
        <br />
        <label>
          Description:
          <textarea 
            value={description} 
            onChange={(e) => setDescription(e.target.value)} 
            required 
          />
        </label>
        <br />
        <button type="submit">Submit Report</button>
      </form>
    </div>
  );
}

export default ReportContent;