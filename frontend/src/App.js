import React from 'react';
import { jwtDecode } from 'jwt-decode';
import Login from './components/Login';
import AdminDashboard from './components/AdminDashboard';
import MemberDashboard from './components/MemberDashboard';
import BookList from './components/BookList';
import './App.css';

function App() {
  const isAuthenticated = !!localStorage.getItem('access');

  const handleLogout = () => {
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    window.location.href = '/';
  };

  const token = localStorage.getItem('access');
  let user = { user_id: null, is_staff: false };
  try {
    if (token) user = jwtDecode(token);
  } catch (err) {
    console.error('Invalid token', err);
  }

  return (
    <div className="App">
      <header className="navbar">
        <div />
        <div className="navbar-title">Advanced Library Management System (ALMS)</div>
        <div className="navbar-actions">
          {isAuthenticated && <button onClick={handleLogout}>Logout</button>}
        </div>
      </header>

      {!isAuthenticated ? (
        <div className="login-page-wrapper">
          <div className="login-card">
            <Login />
          </div>
        </div>
      ) : (
        <div className="page-content">
          {user.is_staff ? (
            <AdminDashboard />
          ) : (
            <>
              <MemberDashboard />
              <BookList />
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
