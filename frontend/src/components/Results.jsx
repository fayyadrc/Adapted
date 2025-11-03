import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export default function Results() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (location.state?.id) {
      navigate(`/results/${location.state.id}`, { state: location.state, replace: true });
    }
  }, [location.state, navigate]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">No results yet</h1>
        <p className="text-gray-600">
          Generate content from the Upload page to view it here.
        </p>
      </div>
    </div>
  );
}