// src/components/Admin/Notifications.js
import React, { useState } from 'react';
import axios from 'axios';

function Notifications({ reportId, onClose, type, onNotificationSent }) {
  const [message, setMessage] = useState('');
  const token = localStorage.getItem('token');
  const adminUsername = localStorage.getItem('username');

  const handleSendNotification = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        `http://localhost:5000/admin/notifications?username=${adminUsername}`,
        { message, reportId , type },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert('Notification sent!');
      setMessage('');
      onClose();
      onNotificationSent();
    } catch (error) {
      alert('Error sending notification');
      console.error('Error sending notification:', error);
    }
  };

  return (
    <div>
      <h2>Send Notification</h2>
      <form onSubmit={handleSendNotification}>
        <label>
          Message:
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
          />
        </label>
        <br />
        <button type="submit">Send Notification</button>
      </form>
      <button onClick={onClose}>Close</button>
    </div>
  );
}

export default Notifications;