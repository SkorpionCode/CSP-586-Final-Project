// src/components/Admin/BecomeAdmin.js
import React from 'react';
import axios from 'axios';

function BecomeAdmin() {
  const token = localStorage.getItem('token');
  const username = localStorage.getItem('username');

  const handleBecomeAdmin = async () => {
    try {
      await axios.post('http://localhost:5000/become-admin', { username }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      alert('You are now an admin!');
      localStorage.setItem('role', 'admin');
      window.location.reload();
    } catch (error) {
      alert('Error becoming an admin');
    }
  };

  return (
    <div>
      <h2>Become an Admin</h2>
      <button onClick={handleBecomeAdmin}>Become Admin</button>
    </div>
  );
}

export default BecomeAdmin;