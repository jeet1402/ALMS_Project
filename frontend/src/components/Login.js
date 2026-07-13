import React, { useState } from 'react';
import axios from 'axios';

const Login = () => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:8000/api/token/', credentials);
      localStorage.setItem('access', response.data.access);
      localStorage.setItem('refresh', response.data.refresh);
      window.location.reload();
    } catch (error) {
      console.error("Login failed:", error);
      alert('Invalid username or password.');
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <h2>Member Login</h2>
      <input
        type="text"
        placeholder="Username"
        onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
        required
      />
      <input
        type="password"
        placeholder="Password"
        onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
        required
      />
      <button type="submit">Login</button>
    </form>
  );
};

export default Login;
