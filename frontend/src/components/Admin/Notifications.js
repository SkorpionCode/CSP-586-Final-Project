// src/components/Admin/Notifications.js
import React, { useState } from 'react';
import axios from 'axios';

function Notifications() {
  const [message, setMessage] = useState('');
  const token = localStorage.getItem('token');

  const handleSendNotification = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/admin/notifications', { message }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      alert('Notification sent!');
      setMessage('');
    } catch (error) {
      alert('Error sending notification');
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
    </div>
  );
}

export default Notifications;