import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Header({ isLoggedIn, onLogout }) {
  const location = useLocation();
  
  return (
    <header className="w-full bg-white shadow-sm px-6 py-4">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <Link to={isLoggedIn ? "/dashboard" : "/"} className="flex items-center">
          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center mr-3">
            <span className="text-white font-bold text-lg">A</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">
            AdaptEd
          </h1>
        </Link>
        
        {isLoggedIn ? (
          <nav className="flex items-center space-x-1">
            <Link
              to="/dashboard"
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                location.pathname === '/dashboard' 
                  ? 'bg-purple-100 text-purple-700' 
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
              }`}
            >
              Dashboard
            </Link>
            <Link
              to="/upload"
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                location.pathname === '/upload' 
                  ? 'bg-purple-100 text-purple-700' 
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
              }`}
            >
              Upload
            </Link>
            <Link
              to="/assessment"
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                location.pathname === '/assessment' 
                  ? 'bg-purple-100 text-purple-700' 
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
              }`}
            >
              Assessment
            </Link>
            <button
              onClick={onLogout}
              className="px-4 py-2 rounded-lg font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 transition-colors"
            >
              Logout
            </button>
          </nav>
        ) : (
          <nav className="flex space-x-1">
            <Link
              to="/login"
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                location.pathname === '/login' 
                  ? 'bg-purple-100 text-purple-700' 
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
              }`}
            >
              Login
            </Link>
            <Link
              to="/signup"
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                location.pathname === '/signup' 
                  ? 'bg-purple-100 text-purple-700' 
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
              }`}
            >
              Sign Up
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}

