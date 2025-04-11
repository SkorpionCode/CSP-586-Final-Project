// src/components/Admin/AdminReports.js
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Notifications from './Notifications';
import {
  Container,
  Typography,
  List,
  ListItem,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Box,
} from '@mui/material';

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
      axios
        .get(`http://localhost:5000/admin/reports?username=${username}`)
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
          const reportedUserResponse = await axios.get(
            `http://localhost:5000/user-id-by-username?username=${selectedReport.reported_username}`
          );
          userIdToSuspend = reportedUserResponse.data.user_id;
        } else if (selectedReport.stream_title) {
          const streamOwnerResponse = await axios.get(
            `http://localhost:5000/stream-owner-id-by-title?title=${selectedReport.stream_title}`
          );
          userIdToSuspend = streamOwnerResponse.data.streamer_id;
          const streamOwnerUsernameResponse = await axios.get(
            `http://localhost:5000/username-by-id?id=${userIdToSuspend}`
          );
          usernameToSuspend = streamOwnerUsernameResponse.data.username;
        }

        const adminUsername = localStorage.getItem('username');
        await axios.post(
          `http://localhost:5000/admin/suspend/${userIdToSuspend}?username=${adminUsername}`,
          {},
          { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } }
        );

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
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" sx={{ mb: 2, color: '#0D47A1' }}>
        Active Reports
      </Typography>
      <List>
        {activeReports.map(report => (
          <ListItem button key={report.id} onClick={() => handleReportClick(report)}>
            <ListItemText
              primary={`Reporter: ${report.reporter_username}, Reported User: ${report.reported_username}, Stream: ${report.stream_title}`}
              secondary={`Description: ${report.description}`}
            />
          </ListItem>
        ))}
      </List>
      <Typography variant="h4" sx={{ mt: 4, mb: 2, color: '#0D47A1' }}>
        Inactive Reports
      </Typography>
      <List>
        {inactiveReports.map(report => (
          <ListItem key={report.id}>
            <ListItemText
              primary={`Reporter: ${report.reporter_username}, Reported User: ${report.reported_username}, Stream: ${report.stream_title}`}
              secondary={`Description: ${report.description}`}
            />
          </ListItem>
        ))}
      </List>
      
      {/* Dialog for Selected Report */}
      <Dialog open={Boolean(selectedReport)} onClose={() => setSelectedReport(null)}>
        <DialogTitle>Report Details</DialogTitle>
        <DialogContent>
          <DialogContentText>
            <strong>Report ID:</strong> {selectedReport?.id}<br />
            <strong>Description:</strong> {selectedReport?.description}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button variant="contained" color="error" onClick={handleSuspendUser}>
            Suspend User
          </Button>
          <Button variant="contained" onClick={handleDismissReport}>
            Dismiss Report
          </Button>
          <Button variant="outlined" onClick={() => setSelectedReport(null)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Dialog for Notifications */}
      <Dialog open={showNotifications} onClose={() => setShowNotifications(false)}>
        <DialogTitle>Notification</DialogTitle>
        <DialogContent>
          <DialogContentText>
            <Notifications
              reportId={notificationReportId}
              onClose={() => setShowNotifications(false)}
              type={notificationType}
              onNotificationSent={reloadReports}
            />
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" onClick={() => setShowNotifications(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
      
      <Box sx={{ mt: 4 }}>
        <Button variant="contained" onClick={() => navigate('/admin/users')}>
          Unsuspend User
        </Button>
      </Box>
    </Container>
  );
}

export default AdminReports;