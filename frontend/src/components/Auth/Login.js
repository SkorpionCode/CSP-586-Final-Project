// src/components/Auth/Login.js
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/login', { username, password });
      localStorage.setItem('token', response.data.access_token);
      localStorage.setItem('role', response.data.role);
      if (response.data.user_id) {
        localStorage.setItem('user_id', response.data.user_id);
        localStorage.setItem('username', response.data.username);
        localStorage.setItem('email', response.data.email)
        localStorage.setItem('role', response.data.role)
      }
      navigate('/browse');
      window.location.reload();
    } catch (error) {
      alert('Login failed: ' + (error.response?.data?.msg || 'Error'));
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <label>
          Username:
          <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
        </label>
        <br />
        <label>
          Password:
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </label>
        <br />
        <button type="submit">Login</button>
        <br />
        <p>If you don't have an acconut: </p>
        <Link to={`/signup`}>Sign Up</Link>
      </form>
    </div>
  );
}

export default Login;