// src/components/Admin/AdminReports.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

function AdminReports() {
  const [reports, setReports] = useState([]);
  const token = localStorage.getItem('token');

  useEffect(() => {
    axios.get('http://localhost:5000/admin/reports', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(response => setReports(response.data))
    .catch(error => console.error('Error fetching reports:', error));
  }, [token]);

  return (
    <div>
      <h2>Reported Content</h2>
      <ul>
        {reports.map(report => (
          <li key={report.id}>
            Report ID: {report.id}, Reporter: {report.reporter_id}, Stream: {report.stream_id}, Description: {report.description}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default AdminReports;