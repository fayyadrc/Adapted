import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import MindMapViewer from './MindMapViewer';

const LAST_RESULT_STORAGE_KEY = 'adapted:last-result';

const loadCachedResult = () => {
  if (typeof window === 'undefined') return null;
  const raw = window.sessionStorage.getItem(LAST_RESULT_STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (err) {
    console.warn('Unable to parse cached result payload', err);
    return null;
  }
};

const persistResult = (payload) => {
  if (typeof window === 'undefined' || !payload) return;
  try {
    window.sessionStorage.setItem(LAST_RESULT_STORAGE_KEY, JSON.stringify(payload));
  } catch (err) {
    console.warn('Unable to persist result payload', err);
  }
};

export default function Results() {
  const location = useLocation();
  const navigate = useNavigate();

  const [result, setResult] = useState(() => {
    if (location.state) return location.state;
    return loadCachedResult();
  });

  useEffect(() => {
    if (location.state?.id) {
      persistResult(location.state);
      navigate(`/results/${location.state.id}`, { state: location.state, replace: true });
      return;
    }

    if (location.state) {
      setResult(location.state);
      persistResult(location.state);
    }
  }, [location.state, navigate]);

  const visualFormat = result?.formats?.visual;

  const renderContent = () => {
    if (!visualFormat) {
      return (
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">No results yet</h1>
          <p className="text-gray-600 mb-6">
            Generate content from the Upload page to view it here.
          </p>
          <Link to="/upload" className="btn-primary inline-block">
            Create a mind map
          </Link>
        </div>
      );
    }

    if (visualFormat.error) {
      return (
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Mind map unavailable</h1>
          <p className="text-gray-600 mb-6">{visualFormat.error}</p>
          <Link to="/upload" className="btn-primary inline-block">
            Try again
          </Link>
        </div>
      );
    }

    if (!visualFormat.data) {
      return (
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Mind map is processing</h1>
          <p className="text-gray-600 mb-6">Check back in a moment.</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
          <MindMapViewer mindMapData={visualFormat.data} />
        </div>
        {result?.id && (
          <div className="text-center">
            <Link
              to={`/results/${result.id}`}
              state={result}
              className="btn-secondary inline-block"
            >
              View more details
            </Link>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {renderContent()}
      </div>
    </div>
  );
}