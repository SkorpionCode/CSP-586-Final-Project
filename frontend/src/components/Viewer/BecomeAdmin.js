// src/components/Admin/BecomeAdmin.js
import React from 'react';
import axios from 'axios';
import { Container, Box, Typography, Button } from '@mui/material';

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
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2,
          p: 2,
          bgcolor: '#ffffff',
          borderRadius: 2,
          boxShadow: 2,
        }}
      >
        <Typography variant="h5" sx={{ color: '#0D47A1' }}>
          Become a Admin
        </Typography>
        <Button
          variant="contained"
          onClick={handleBecomeAdmin}
          sx={{
            backgroundColor: '#0D47A1',
            color: '#fff',
            '&:hover': { backgroundColor: '#0A356E' },
          }}
        >
          Become Admin
        </Button>
      </Box>
    </Container>
  );
}

export default BecomeAdmin;