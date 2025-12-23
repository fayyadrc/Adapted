import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Login from './components/Login';
import Signup from './components/Signup';
import Upload from './components/Upload';
import Library from './components/Library';
import ResultDetail from './components/ResultDetail';
import Assessment from './components/Assessment';
import Profile from './components/Profile';
import HomePage from './components/HomePage';
import Explore from './components/Explore';
import LandingPage from './components/LandingPage';
import './App.css';

import { supabase } from './supabaseConfig';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for changes - only update if session actually changed
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const newUserId = session?.user?.id ?? null;
      
      // Only trigger state updates if the user actually changed
      setUser(prevUser => {
        const prevUserId = prevUser?.id ?? null;
        if (prevUserId !== newUserId) {
          setIsLoggedIn(!!session);
          return session?.user ?? null;
        }
        return prevUser;
      });
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = (userData) => {
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setIsLoggedIn(false);
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }


  const ProtectedRoute = ({ children }) => {
    return isLoggedIn ? children : <Navigate to="/login" />;
  };

  // Component to conditionally render header based on route
  const AppContent = () => {
    const location = useLocation();
    const isLandingPage = location.pathname === '/' && !isLoggedIn;
    
    return (
      <div className="min-h-screen bg-white">
        {/* Hide Header on landing page when not logged in */}
        {!isLandingPage && (
          <Header isLoggedIn={isLoggedIn} onLogout={handleLogout} user={user} />
        )}

        <Routes>
          {/* Public Routes */}
          <Route path="/" element={isLoggedIn ? <Navigate to="/home" /> : <LandingPage />} />
          <Route path="/login" element={isLoggedIn ? <Navigate to="/home" /> : <Login onLogin={handleLogin} />} />
          <Route path="/signup" element={isLoggedIn ? <Navigate to="/home" /> : <Signup onLogin={handleLogin} />} />

          {/* Protected Routes */}
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <HomePage user={user} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/library"
            element={
              <ProtectedRoute>
                <Library user={user} />
              </ProtectedRoute>
            }
          />
          {/* Redirect old routes to library */}
          <Route path="/lessons" element={<Navigate to="/library" replace />} />
          <Route path="/results" element={<Navigate to="/library" replace />} />
          <Route
            path="/results/:id"
            element={
              <ProtectedRoute>
                <ResultDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/upload"
            element={
              <ProtectedRoute>
                <Upload user={user} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/assessment"
            element={
              <ProtectedRoute>
                <Assessment />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/explore"
            element={
              <ProtectedRoute>
                <Explore />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    );
  };

  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
