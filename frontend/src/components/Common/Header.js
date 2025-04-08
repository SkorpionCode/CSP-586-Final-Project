// src/components/Header.js
import React from 'react';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const navigate = useNavigate();
  // Retrieve the username from localStorage; if not present, default to 'Guest'
  const username = localStorage.getItem('username') || 'Guest';

  return (
    <header style={{
      padding: '1rem',
      background: '#f1f1f1',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }}>
      <div>
        <strong>Welcome, {username}!</strong>
      </div>
      <div>
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
        <button onClick={() => navigate('/browse-streams')}>
          Browse Streams
        </button>
      </div>
    </header>
  );
};

export default Header;