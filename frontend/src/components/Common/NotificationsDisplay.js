// src/components/Common/NotificationsDisplay.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import { Box, Paper, Typography, List, ListItem, ListItemText } from '@mui/material';

let socket;

function NotificationsDisplay() {
  const [notifications, setNotifications] = useState([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const username = localStorage.getItem('username');

  useEffect(() => {
    if (username) {
      socket = io('http://localhost:5000');
      socket.on('notification', (data) => {
        // Only process notifications meant for the current user
        if (data.username === username) {
          setNotifications((prev) => [data, ...prev]);
        }
      });

      return () => {
        if (socket) {
          socket.disconnect();
        }
      };
    } else {
      if (socket) {
        socket.disconnect();
        socket = null;
      }
      setNotifications([]);
    }
  }, [username]);

  useEffect(() => {
    if (username && isExpanded) {
      axios.get(`http://localhost:5000/api/notifications?username=${username}`)
        .then((response) => setNotifications(response.data))
        .catch((error) => console.error('Error fetching notifications:', error));
    }
  }, [username, isExpanded]);

  if (!username) {
    return null;
  }

  const handleBoxClick = () => {
    setIsExpanded((prev) => !prev);
  };

  return (
    <Box
      onClick={handleBoxClick}
      sx={{
        position: 'fixed',
        bottom: 10,
        right: 10,
        cursor: 'pointer',
        zIndex: 1000,
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 2,
          bgcolor: '#fff',
          width: isExpanded ? 300 : 100,
          height: isExpanded ? 400 : 50,
          overflowY: isExpanded ? 'auto' : 'hidden',
          transition: 'all 0.3s ease-in-out',
        }}
      >
        <Typography variant="h6" sx={{ mb: isExpanded ? 2 : 0 }}>
          Notifications
        </Typography>
        {isExpanded && (
          <List dense>
            {notifications.map((note, idx) => (
              <ListItem key={idx}>
                <ListItemText
                  primary={note.message}
                  secondary={new Date(note.created_at).toLocaleTimeString()}
                />
              </ListItem>
            ))}
          </List>
        )}
      </Paper>
    </Box>
  );
}

export default NotificationsDisplay;
