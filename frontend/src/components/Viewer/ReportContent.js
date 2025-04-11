// src/components/Viewer/ReportContent.js
import React, { useState } from 'react';
import axios from 'axios';

function ReportContent() {
  const [reportType, setReportType] = useState('stream');
  const [targetName, setTargetName] = useState(''); // Stream title or username
  const [description, setDescription] = useState('');
  const username = localStorage.getItem('username');

  const handleReport = async (e) => {
    e.preventDefault();
    try {
      let reportData = { description, username };
      if (reportType === 'stream') {
        reportData.stream_title = targetName;
      } else if (reportType === 'user') {
        reportData.reported_username = targetName;
      }

      await axios.post('http://localhost:5000/report', reportData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      alert('Report submitted!');
      setTargetName('');
      setDescription('');
    } catch (error) {
      if (error.response && error.response.status === 400) {
        alert(error.response.data.msg);
      } else {
        alert('Error submitting report: ' + error.message);
      }
    }
  };

  return (
    <div>
      <h2>Report Content</h2>
      <form onSubmit={handleReport}>
        <label>
          Report Type:
          <select value={reportType} onChange={(e) => setReportType(e.target.value)}>
            <option value="stream">Stream</option>
            <option value="user">User</option>
          </select>
        </label>
        <br />
        <label>
          {reportType === 'stream' ? 'Stream Title:' : 'Username:'}
          <input
            type="text"
            value={targetName}
            onChange={(e) => setTargetName(e.target.value)}
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