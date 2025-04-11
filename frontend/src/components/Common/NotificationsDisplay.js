// src/components/Common/NotificationsDisplay.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client';

let socket;

function NotificationsDisplay() {
  const [notifications, setNotifications] = useState([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const username = localStorage.getItem('username');

  useEffect(() => {
    if (username) {
      socket = io('http://localhost:5000');
      socket.on('notification', (data) => {
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
    setIsExpanded(!isExpanded);
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 10,
        right: 10,
        border: '1px solid #ccc',
        padding: '10px',
        background: '#fff',
        zIndex: 1000,
        maxWidth: isExpanded ? '300px' : '100px',
        maxHeight: isExpanded ? '400px' : '50px',
        overflowY: isExpanded ? 'auto' : 'hidden',
        cursor: 'pointer',
      }}
      onClick={handleBoxClick}
    >
      <h4>Notifications</h4>
      {isExpanded && (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {notifications.map((note, idx) => (
            <li key={idx}>
              {note.message} <br />
              <small>{new Date(note.created_at).toLocaleTimeString()}</small>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default NotificationsDisplay;