import React, { useState } from 'react';
import { jwtDecode } from 'jwt-decode'; // Import the library
import Login from './components/Login';
import BookList from './components/BookList';
import MemberDashboard from './components/MemberDashboard';
import AdminDashboard from './components/AdminDashboard'; // Import this
import AdminCirculation from './components/AdminCirculation';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('access'));
  const [isStaff, setIsStaff] = useState(false); // You should ideally set this based on token claims

  const handleLogout = () => {
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    setIsAuthenticated(false);
    setIsStaff(false);
    window.location.href = '/';
  };

  // Safely decode token only if it exists
  const token = localStorage.getItem('access');
  const user = token ? jwtDecode(token) : { user_id: null }; 
  if(user) {
	  console.log("Decoded JWT Payload:", user);
  }

  return (
    <div className="App">
      <header>
        <h1>Advanced Library Management System (ALMS)</h1>
        {isAuthenticated && (
          <button onClick={handleLogout}>Logout</button>
        )}
      </header>

      <main>
        {!isAuthenticated ? (
          <>
            <Login />
            <hr />
            <BookList />
          </>
        ) : (
          <>
            {user.user_id === "1" ? (
              <>
                <AdminDashboard />
                <AdminCirculation />
              </>
            ) : (
              <>
                <MemberDashboard />
                <hr />
                <BookList />
              </>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default App;
