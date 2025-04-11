// src/components/Header.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Header = () => {
  const navigate = useNavigate();
  // Retrieve the token and username from localStorage.
  const token = localStorage.getItem('token');
  const username = localStorage.getItem('username') || 'Guest';
  const role = localStorage.getItem('role');

  const handleLogout = async () => {
    try {
      // Optionally, call the backend logout endpoint.
      await axios.post(
        'http://localhost:5000/logout',
        {},
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
    } catch (error) {
      console.error('Logout error:', error);
      // We clear local storage even if the logout request fails.
    }
    // Clear user-related information.
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('user_id');
    localStorage.removeItem('role');
    // Navigate to the login page.
    navigate('/login');
    window.location.reload()
  };

  return (
    <header
      style={{
        padding: '1rem',
        background: '#f1f1f1',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      {token ? (
        // When a user is signed in
        <>
          <div>
            <strong>Welcome, {username}!</strong>
          </div>
          <div>
            <button
              onClick={handleLogout}
              style={{ marginRight: '0.5rem' }}
            >
              Logout
            </button>
            <button
              onClick={() => navigate('/profile')}
              style={{ marginRight: '0.5rem' }}
            >
              Profile
            </button>
            <button
              onClick={() => navigate('/become-streamer')}
              style={{ marginRight: '0.5rem' }}
            >
              Become Streamer
            </button>
            <button
              onClick={() => navigate('/become-admin')}
              style={{ marginRight: '0.5rem' }}
            >
              Become Admin
            </button>
            {role === 'admin' && (
              <button
                onClick={() => navigate('/admin/reports')}
                style={{ marginRight: '0.5rem' }}
              >
                View Reports
              </button>
            )}
            <button
              onClick={() => navigate('/browse')}
              style={{ marginRight: '0.5rem' }}
            >
              Browse Streams
            </button>
            <button
              onClick={() => navigate('/report')}
              style={{ marginRight: '0.5rem' }}
            >
              Report
            </button>
          </div>
        </>
      ) : (
        <div>
          <button onClick={() => navigate('/signup')}>Sign Up</button>
        </div>
      )}
    </header>
  );
};

export default Header;