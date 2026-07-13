import React, { useState } from 'react';
import axios from 'axios';

const Login = ({ setAuth }) => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      // Sending credentials to the JWT endpoint we just configured
      const response = await axios.post('/api/token/', credentials);
      
      // Store the token securely in localStorage
      localStorage.setItem('access', response.data.access);
      localStorage.setItem('refresh', response.data.refresh);
      
      alert('Login successful!');
      window.location.reload(); // Refresh to update UI
    } catch (error) {
      console.error("Login failed:", error);
      alert('Invalid username or password.');
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <h2>Member Login</h2>
      <input type="text" placeholder="Username" onChange={(e) => setCredentials({...credentials, username: e.target.value})} required />
      <input type="password" placeholder="Password" onChange={(e) => setCredentials({...credentials, password: e.target.value})} required />
      <button type="submit">Login</button>
    </form>
  );
};

export default Login;
