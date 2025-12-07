import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiService from '../services/apiService';

export default function Dashboard({ user }) {
  const [recentResults, setRecentResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load recent results from Supabase API
    const loadResults = async () => {
      try {
        setLoading(true);
        const results = await apiService.getResults(user?.id);
        // Get the 3 most recent results
        setRecentResults(results.slice(0, 3));
      } catch (error) {
        console.error('Failed to load results:', error);
        setRecentResults([]);
      } finally {
        setLoading(false);
      }
    };
    
    if (user?.id) {
      loadResults();
    } else {
      setLoading(false);
    }
  }, [user?.id]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric'
    });
  };

  const getFormatCount = (formats) => {
    return Object.keys(formats || {}).length;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome Section */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.user_metadata?.name || user?.email?.split('@')[0] || 'Student'}!
          </h1>
          <p className="text-gray-600">
            Transform your learning materials into personalized formats
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Link
            to="/upload"
            className="card hover:shadow-md transition-shadow cursor-pointer group h-full"
          >
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Upload Content</h3>
                <p className="text-sm text-gray-600">Add new materials</p>
              </div>
            </div>
          </Link>

          <Link
            to="/library"
            className="card hover:shadow-md transition-shadow cursor-pointer group h-full"
          >
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">My Library</h3>
                <p className="text-sm text-gray-600">View all content</p>
              </div>
            </div>
          </Link>

          <Link
            to="/assessment"
            className="card hover:shadow-md transition-shadow cursor-pointer group h-full"
          >
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Assessment</h3>
                <p className="text-sm text-gray-600">Find your style (Coming soon)</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Recent Results */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Recent Results</h2>
            {recentResults.length > 0 && (
              <Link to="/library" className="text-purple-600 hover:text-purple-700 font-medium text-sm">
                View all →
              </Link>
            )}
          </div>
          
          {recentResults.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-gray-600 mb-4">Nothing yet!</p>
              <Link to="/upload" className="btn-primary">
                Upload Now
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {recentResults.map(result => (
                <div key={result.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{result.title}</h3>
                    <p className="text-sm text-gray-600">
                      Uploaded {formatDate(result.uploadedAt)}
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="px-3 py-1 rounded-full text-sm font-medium bg-green-50 text-green-700 border border-green-200">
                      {getFormatCount(result.formats)} {getFormatCount(result.formats) === 1 ? 'format' : 'formats'}
                    </div>
                    
                    <Link
                      to={`/results/${result.id}`}
                      state={result}
                      className="text-purple-600 hover:text-purple-700 font-medium text-sm"
                    >
                      View →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}