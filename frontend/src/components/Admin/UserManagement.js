// src/components/Admin/UserManagement.js
import React, { useState } from 'react';
import axios from 'axios';

function UserManagement() {
  const [username, setUsername] = useState('');
  const token = localStorage.getItem('token');
  const adminUsername = localStorage.getItem('username');

  const handleUnsuspend = async () => {
    try {
      await axios.post(`http://localhost:5000/admin/unsuspend/${username}?admin_username=${adminUsername}`, {}, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      alert(`User ${username} has been unsuspended.`);
      setUsername('');
    } catch (error) {
      alert('Error unsuspending user');
    }
  };

  return (
    <div>
      <h2>User Management</h2>
      <label>
        Username to Unsuspend:
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </label>
      <br />
      <button onClick={handleUnsuspend}>Unsuspend User</button>
    </div>
  );
}

export default UserManagement;