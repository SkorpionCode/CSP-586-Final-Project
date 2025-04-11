// src/components/Auth/Login.js
import React, { useState } from 'react';
import axios from 'axios';
import { Container, TextField, Button, Typography, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const [usernameFocused, setUsernameFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!username || !password) {
      alert('Please fill in all fields.');
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/login', { username, password });
      localStorage.setItem('token', response.data.access_token);
      localStorage.setItem('role', response.data.role);
      if (response.data.user_id) {
        localStorage.setItem('user_id', response.data.user_id);
        localStorage.setItem('username', response.data.username);
        localStorage.setItem('email', response.data.email);
        localStorage.setItem('role', response.data.role);
      }
      navigate('/browse');
      window.location.reload();
    } catch (error) {
      alert('Login failed: ' + (error.response?.data?.msg || 'Error'));
    }
  };

  const handleSignupNavigation = () => {
    navigate('/signup');
  };

  const isFormValid = username && password;

  return (
    <Container
      maxWidth="sm"
      sx={{
        backgroundColor: '#ffffff',
        padding: 4,
        marginTop: 8,
        borderRadius: 2,
        boxShadow: '0px 0px 10px rgba(0,0,0,0.1)',
      }}
    >
      <Typography
        variant="h4"
        component="h1"
        align="center"
        sx={{ color: '#0D47A1', marginBottom: 2 }}
      >
        Login
      </Typography>
      <Box component="form" onSubmit={handleLogin} noValidate>
        <TextField
          label="Username"
          variant="outlined"
          fullWidth
          required
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          onFocus={() => setUsernameFocused(true)}
          onBlur={() => setUsernameFocused(username.length > 0)}
          sx={{
            marginBottom: 2,
            '& .MuiOutlinedInput-root': {
              '&.Mui-focused fieldset, & fieldset.Mui-focused': {
                borderColor: '#0D47A1',
                borderWidth: '2px',
              },
              '& fieldset': {
                borderColor: usernameFocused ? '#0D47A1' : undefined,
                borderWidth: usernameFocused ? '2px' : '1px',
              },
              '&:hover fieldset':{
                borderColor: usernameFocused ? '#0D47A1' : undefined,
              }
            },
          }}
        />
        <TextField
          label="Password"
          type="password"
          variant="outlined"
          fullWidth
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onFocus={() => setPasswordFocused(true)}
          onBlur={() => setPasswordFocused(password.length > 0)}
          sx={{
            marginBottom: 2,
            '& .MuiOutlinedInput-root': {
              '&.Mui-focused fieldset, & fieldset.Mui-focused': {
                borderColor: '#0D47A1',
                borderWidth: '2px',
              },
              '& fieldset': {
                borderColor: passwordFocused ? '#0D47A1' : undefined,
                borderWidth: passwordFocused ? '2px' : '1px',
              },
              '&:hover fieldset':{
                borderColor: passwordFocused ? '#0D47A1' : undefined,
              }
            },
          }}
        />
        <Button
          type="submit"
          fullWidth
          variant="contained"
          disabled={!isFormValid}
          sx={{
            backgroundColor: isFormValid ? '#0D47A1' : '#BDBDBD',
            color: '#ffffff',
            '&:hover': { backgroundColor: isFormValid ? '#0A356E' : '#BDBDBD' },
            marginTop: 1,
          }}
        >
          Login
        </Button>
        <Button
          fullWidth
          variant="contained"
          sx={{
            backgroundColor: '#0D47A1',
            color: '#ffffff',
            '&:hover': { backgroundColor: '#0A356E' },
            marginTop: 1,
          }}
          onClick={handleSignupNavigation}
        >
          Sign Up
        </Button>
      </Box>
    </Container>
  );
}

export default Login;