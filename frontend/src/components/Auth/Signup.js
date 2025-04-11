// src/components/Auth/Signup.js
import React, { useState } from 'react';
import axios from 'axios';
import { Container, TextField, Button, Typography, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';

function Signup() {
  const [username, setUsername]     = useState('');
  const [email, setEmail]           = useState('');
  const [password, setPassword]     = useState('');
  const navigate                  = useNavigate();
  
  // Focus states for styling, as before.
  const [usernameFocused, setUsernameFocused] = useState(false);
  const [emailFocused, setEmailFocused]       = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();

    if (!username || !email || !password) {
      alert('Please fill in all fields.');
      return;
    }

    try {
      // First, send a signup request.
      await axios.post('http://localhost:5000/signup', { username, email, password });
      alert('Account created successfully! Logging you in...');

      // Auto-login: Send a login request using the same credentials.
      const loginResponse = await axios.post('http://localhost:5000/login', { username, password });
      
      // Store login data (including username) in localStorage.
      localStorage.setItem('token', loginResponse.data.access_token);
      localStorage.setItem('role', loginResponse.data.role);
      localStorage.setItem('user_id', loginResponse.data.user_id);
      localStorage.setItem('email', loginResponse.data.email);
      localStorage.setItem('username', loginResponse.data.username);

      // Navigate to the browse page and reload so the header updates.
      navigate('/browse');
      window.location.reload();
    } catch (error) {
      alert('Signup failed: ' + (error.response?.data?.msg || error));
    }
  };

  const handleLoginNavigation = () => {
    navigate('/login');
  };

  const isFormValid = username && email && password;

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
              '&:hover fieldset': {
                borderColor: usernameFocused ? '#0D47A1' : undefined,
              },
            },
          }}
        />
        <TextField
          label="Email"
          type="email"
          variant="outlined"
          fullWidth
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onFocus={() => setEmailFocused(true)}
          onBlur={() => setEmailFocused(email.length > 0)}
          sx={{
            marginBottom: 2,
            '& .MuiOutlinedInput-root': {
              '&.Mui-focused fieldset, & fieldset.Mui-focused': {
                borderColor: '#0D47A1',
                borderWidth: '2px',
              },
              '& fieldset': {
                borderColor: emailFocused ? '#0D47A1' : undefined,
                borderWidth: emailFocused ? '2px' : '1px',
              },
              '&:hover fieldset': {
                borderColor: emailFocused ? '#0D47A1' : undefined,
              },
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
              '&:hover fieldset': {
                borderColor: passwordFocused ? '#0D47A1' : undefined,
              },
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
          Signup
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
          onClick={handleLoginNavigation}
        >
          Log In
        </Button>
      </Box>
    </Container>
  );
}

export default Signup;