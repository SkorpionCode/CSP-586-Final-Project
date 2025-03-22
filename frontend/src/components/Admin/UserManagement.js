// src/components/Admin/UserManagement.js
import React, { useState } from 'react';
import axios from 'axios';

function UserManagement() {
  const [userId, setUserId] = useState('');
  const token = localStorage.getItem('token');

  const handleSuspend = async () => {
    try {
      await axios.post(`http://localhost:5000/admin/suspend/${userId}`, {}, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      alert(`User ${userId} has been suspended`);
      setUserId('');
    } catch (error) {
      alert('Error suspending user');
    }
  };

  return (
    <div>
      <h2>User Management</h2>
      <label>
        User ID to Suspend:
        <input 
          type="text" 
          value={userId} 
          onChange={(e) => setUserId(e.target.value)} 
        />
      </label>
      <br />
      <button onClick={handleSuspend}>Suspend User</button>
    </div>
  );
}

export default UserManagement;