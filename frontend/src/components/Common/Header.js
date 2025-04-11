// src/components/Header.js
import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Header() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const username = localStorage.getItem('username') || 'Guest';
  const role = localStorage.getItem('role');

  const handleLogout = async () => {
    try {
      await axios.post(
        'http://localhost:5000/logout',
        {},
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
    } catch (error) {
      console.error('Logout error:', error);
    }
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('user_id');
    localStorage.removeItem('role');
    navigate('/login');
  };

  return (
    <AppBar position="static" sx={{ backgroundColor: '#0D47A1' }}>
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          {token ? `Welcome, ${username}!` : 'Welcome, Guest!'}
        </Typography>
        {token ? (
          <Box>
            <Button color="inherit" onClick={() => navigate('/profile')}>
              Profile
            </Button>
            <Button color="inherit" onClick={() => navigate('/become-streamer')}>
              Become Streamer
            </Button>
            <Button color="inherit" onClick={() => navigate('/become-admin')}>
              Become Admin
            </Button>
            {role === 'admin' && (
              <Button color="inherit" onClick={() => navigate('/admin/reports')}>
              View Reports
            </Button>
            )}
            <Button color="inherit" onClick={() => navigate('/browse')}>
              Browse Streams
            </Button>
            <Button color="inherit" onClick={() => navigate('/report')}>
              Report
          </Button>
            <Button color="inherit" onClick={handleLogout}>
              Logout
            </Button>
          </Box>
        ) : (
          <Button color="inherit" onClick={() => navigate('/login')}>
            Login
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
}

export default Header;