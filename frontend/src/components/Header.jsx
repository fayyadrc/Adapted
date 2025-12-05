import React from 'react';
import { Link } from 'react-router-dom';
import { User, LogOut } from 'lucide-react';

export default function Header({ isLoggedIn, onLogout, user }) {
  return (
    <header className="w-full bg-white shadow-sm px-6 py-4">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <Link to={isLoggedIn ? "/home" : "/"} className="flex items-center">
          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center mr-3">
            <span className="text-white font-bold text-lg">A</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">
            AdaptEd
          </h1>
        </Link>

        {isLoggedIn ? (
          <div className="flex items-center gap-4">
            {/* Profile Section */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-purple-600" />
              </div>
              <span className="text-sm font-medium text-gray-700">
                {user?.email || 'Account'}
              </span>
            </div>

            {/* Logout Button */}
            <button
              onClick={onLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        ) : (
          <nav className="flex space-x-1">
            <Link
              to="/login"
              className="px-4 py-2 rounded-lg font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 transition-colors"
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="px-4 py-2 rounded-lg font-medium bg-purple-600 text-white hover:bg-purple-700 transition-colors"
            >
              Sign Up
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}

