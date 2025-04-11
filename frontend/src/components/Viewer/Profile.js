// src/components/Viewer/Profile.js
import React, { useState, useEffect } from 'react';
import { Container, TextField, Button, Typography, Box, Card, CardContent } from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Profile() {
  const token = localStorage.getItem('token');
  const navigate = useNavigate();
  const [profile, setProfile] = useState({
    username: localStorage.getItem('username'),
    email: localStorage.getItem('email'),
    profile_picture: '',
    bio: '',
    role: localStorage.getItem('role'),
  });

  useEffect(() => {
    axios
      .get('http://localhost:5000/profile', {
        headers: { 'Authorization': `Bearer ${token}` },
      })
      .then((response) => {
        setProfile(response.data);
      })
      .catch((error) => {
        console.error('Error fetching profile:', error);
      });
  }, [token]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await axios.put('http://localhost:5000/profile', profile, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      alert('Profile updated!');
    } catch (error) {
      alert('Error updating profile: ' + (error.response?.data?.msg || error.message));
    }
  };

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Card>
        <CardContent>
          <Typography variant="h4" sx={{ mb: 2, color: '#0D47A1' }}>
            Your Profile
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Username: {profile.username}
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Email: {profile.email}
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Role: {profile.role}
          </Typography>
          <Box component="form" onSubmit={handleUpdate} noValidate>
            <TextField
              label="Profile Picture URL"
              name="profile_picture"
              variant="outlined"
              fullWidth
              value={profile.profile_picture || ''}
              onChange={handleChange}
              sx={{ mb: 2 }}
            />
            <TextField
              label="Bio"
              name="bio"
              variant="outlined"
              fullWidth
              multiline
              rows={4}
              value={profile.bio || ''}
              onChange={handleChange}
              sx={{ mb: 2 }}
            />
            <Button type="submit" fullWidth variant="contained" sx={{ backgroundColor: '#0D47A1', color: '#fff', '&:hover': { backgroundColor: '#0A356E' } }}>
              Update Profile
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
}

export default Profile;