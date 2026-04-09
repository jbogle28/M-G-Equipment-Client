import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';

// 1. Enhanced Gatekeeper Component
const ProtectedRoute = ({ children }) => {
  const rawData = localStorage.getItem('user');
  
  // Debugging: Open browser console (F12) to see this
  console.log("Auth Check - Raw Data:", rawData);

  if (!rawData) {
    return <Navigate to="/" replace />;
  }

  try {
    const user = JSON.parse(rawData);
    
    // Check if it's an object with a token OR just a string token
    const isAuthenticated = (user && user.token) || (typeof user === 'string' && user.length > 10);

    if (!isAuthenticated) {
      console.warn("Auth Check - No valid token found in user object");
      return <Navigate to="/" replace />;
    }

    return children;
  } catch (error) {
    console.error("Auth Check - Error parsing user data:", error);
    return <Navigate to="/" replace />;
  }
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* 2. Protected Routes */}
        <Route 
          path="/dashboard/*" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />

        {/* Catch-all redirect for broken links */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;