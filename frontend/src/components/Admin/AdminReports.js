// src/components/Admin/AdminReports.js
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Notifications from './Notifications';

function AdminReports() {
  const [activeReports, setActiveReports] = useState([]);
  const [inactiveReports, setInactiveReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [notificationReportId, setNotificationReportId] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationType, setNotificationType] = useState('');
  const username = localStorage.getItem('username');
  const navigate = useNavigate();

  const reloadReports = useCallback(() => {
    if (username) {
      axios.get(`http://localhost:5000/admin/reports?username=${username}`)
        .then(response => {
          setActiveReports(response.data.active_reports);
          setInactiveReports(response.data.inactive_reports);
        })
        .catch(error => console.error('Error fetching reports:', error));
    } else {
      console.error('Username is not available.');
    }
  }, [username]);

  useEffect(() => {
    reloadReports();
  }, [username, reloadReports]);

  const handleReportClick = (report) => {
    setSelectedReport(report);
  };

  const handleSuspendUser = async () => {
    try {
      if (selectedReport) {
        let userIdToSuspend;
        let usernameToSuspend;

        if (selectedReport.reported_username) {
          usernameToSuspend = selectedReport.reported_username;
          const reportedUserResponse = await axios.get(`http://localhost:5000/user-id-by-username?username=${selectedReport.reported_username}`);
          userIdToSuspend = reportedUserResponse.data.user_id;
        } else if (selectedReport.stream_title) {
          const streamOwnerResponse = await axios.get(`http://localhost:5000/stream-owner-id-by-title?title=${selectedReport.stream_title}`);
          userIdToSuspend = streamOwnerResponse.data.user_id;
          const streamOwnerUsernameResponse = await axios.get(`http://localhost:5000/username-by-id?id=${userIdToSuspend}`);
          usernameToSuspend = streamOwnerUsernameResponse.data.username;
        }

        const adminUsername = localStorage.getItem('username');
        await axios.post(`http://localhost:5000/admin/suspend/${userIdToSuspend}?username=${adminUsername}`, {}, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });

        alert(`${usernameToSuspend} was suspended.`);
        await axios.post('http://localhost:5000/handle-report', { report_id: selectedReport.id });
        setNotificationReportId(selectedReport.id);
        setShowNotifications(true);
        setNotificationType("user_suspended");
        setSelectedReport(null);
      }
    } catch (error) {
      console.error('Error suspending user or handling report:', error);
    }
  };

  const handleDismissReport = async () => {
    try {
      if (selectedReport) {
        await axios.post('http://localhost:5000/handle-report', { report_id: selectedReport.id });
        setNotificationReportId(selectedReport.id);
        setShowNotifications(true);
        setNotificationType("report_denied");
        setSelectedReport(null);
      }
    } catch (error) {
      console.error('Error dismissing report:', error);
    }
  };

  return (
    <div>
      <h2>Active Reports</h2>
      <ul>
        {activeReports.map(report => (
          <li key={report.id} onClick={() => handleReportClick(report)}>
            Reporter: {report.reporter_username}, Reported User: {report.reported_username}, Stream: {report.stream_title}, Description: {report.description}
          </li>
        ))}
      </ul>
      <h2>Inactive Reports</h2>
      <ul>
        {inactiveReports.map(report => (
          <li key={report.id}>
            Reporter: {report.reporter_username}, Reported User: {report.reported_username}, Stream: {report.stream_title}, Description: {report.description}
          </li>
        ))}
      </ul>
      {selectedReport && (
        <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'white', padding: '20px', border: '1px solid black' }}>
          <p>Report ID: {selectedReport.id}</p>
          <p>Description: {selectedReport.description}</p>
          <button onClick={handleSuspendUser}>Suspend User</button>
          <button onClick={handleDismissReport}>Dismiss Report</button>
          <button onClick={() => setSelectedReport(null)}>Close</button>
        </div>
      )}
      {showNotifications && (
        <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'white', padding: '20px', border: '1px solid black' }}>
          <Notifications
            reportId={notificationReportId}
            onClose={() => setShowNotifications(false)}
            type={notificationType}
            onNotificationSent={reloadReports}
          />
        </div>
      )}
      <button onClick={() => navigate('/admin/users')}>Unsuspend User</button>
    </div>
  );
}

export default AdminReports;