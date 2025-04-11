// src/components/Admin/UserManagement.js
import React, { useState } from 'react';
import axios from 'axios';
import { Container, Card, CardContent, Typography, TextField, Button, Box } from '@mui/material';

function UserManagement() {
  const [username, setUsername] = useState('');
  const token = localStorage.getItem('token');
  const adminUsername = localStorage.getItem('username');

  const handleUnsuspend = async () => {
    try {
      await axios.post(
        `http://localhost:5000/admin/unsuspend/${username}?admin_username=${adminUsername}`,
        {},
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      alert(`User ${username} has been unsuspended.`);
      setUsername('');
    } catch (error) {
      alert('Error unsuspending user: ' + (error.response?.data?.msg || error.message));
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Card>
        <CardContent>
          <Typography variant="h4" align="center" sx={{ mb: 2, color: '#0D47A1' }}>
            User Management
          </Typography>
          <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Username to Unsuspend"
              variant="outlined"
              fullWidth
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <Button
              type="button"
              variant="contained"
              fullWidth
              onClick={handleUnsuspend}
              sx={{
                backgroundColor: '#0D47A1',
                color: '#fff',
                '&:hover': { backgroundColor: '#0A356E' },
              }}
            >
              Unsuspend User
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
}

export default UserManagement;