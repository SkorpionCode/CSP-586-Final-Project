// src/components/Auth/Signup.js
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { Container, TextField, Button, Typography, Box } from '@mui/material';

function Signup() {
  const [username, setUsername] = useState('');
  const [email, setEmail]     = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/signup', { username, email, password });
      localStorage.setItem('role', response.data.role);
      if (response.data.user_id) {
        localStorage.setItem('user_id', response.data.user_id);
        localStorage.setItem('username', response.data.username);
        localStorage.setItem('email', response.data.email)
        localStorage.setItem('role', response.data.role)
      }
      alert('Account created successfully!');
      navigate('/login');
    } catch (error) {
      alert('Signup failed: ' + (error.response?.data?.msg || error));
    }
  };

  return (
    <Container
      maxWidth="sm"
      sx={{
        backgroundColor: "#ffffff",
        padding: 4,
        marginTop: 8,
        borderRadius: 2,
        boxShadow: "0px 0px 10px rgba(0,0,0,0.1)",
      }}
    >
      <Typography 
        variant="h4" 
        component="h1" 
        align="center" 
        sx={{ color: "#0D47A1", marginBottom: 2 }}
      >
        Signup
      </Typography>
      <Box component="form" onSubmit={handleSignup} noValidate>
        <TextField
          label="Username"
          variant="outlined"
          fullWidth
          required
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          sx={{ marginBottom: 2 }}
        />
        <TextField
          label="Email"
          type="email"
          variant="outlined"
          fullWidth
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          sx={{ marginBottom: 2 }}
        />
        <TextField
          label="Password"
          type="password"
          variant="outlined"
          fullWidth
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          sx={{ marginBottom: 2 }}
        />
        <Button
          type="submit"
          fullWidth
          variant="contained"
          sx={{
            backgroundColor: "#0D47A1",
            color: "#ffffff",
            "&:hover": { backgroundColor: "#0A356E" },
            marginTop: 1,
          }}
        >
          Signup
        </Button>
      </Box>
    </Container>
  );
}

export default Signup;