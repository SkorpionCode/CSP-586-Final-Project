// src/components/Common/NotificationsDisplay.js
import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

let socket;

function NotificationsDisplay() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    // Connect to the Socket.IO server
    socket = io('http://localhost:5000');
    socket.on('notification', (data) => {
      setNotifications((prev) => [...prev, data]);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div style={{
      position: 'fixed',
      top: 10,
      right: 10,
      border: '1px solid #ccc',
      padding: '10px',
      background: '#fff',
      zIndex: 1000,
      maxWidth: '300px'
    }}>
      <h4>Notifications</h4>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {notifications.map((note, idx) => (
          <li key={idx}>
            {note.message} <br />
            <small>{new Date(note.created_at).toLocaleTimeString()}</small>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default NotificationsDisplay;