import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Results() {
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data - replace with real API data
  const allResults = [
    {
      id: 1,
      title: 'Biology Chapter 3 - Photosynthesis',
      uploadDate: '2024-11-01',
      status: 'completed',
      formats: ['mindmap', 'summary', 'audio', 'quiz'],
      thumbnail: '🌱'
    },
    {
      id: 2,
      title: 'History Notes - World War II',
      uploadDate: '2024-10-30',
      status: 'completed',
      formats: ['mindmap', 'summary', 'quiz'],
      thumbnail: '�'
    },
    {
      id: 3,
      title: 'Math - Calculus Derivatives',
      uploadDate: '2024-10-28',
      status: 'processing',
      formats: [],
      thumbnail: '📐'
    },
    {
      id: 4,
      title: 'Chemistry - Periodic Table',
      uploadDate: '2024-10-25',
      status: 'completed',
      formats: ['mindmap', 'summary', 'audio'],
      thumbnail: '🧪'
    },
    {
      id: 5,
      title: 'Physics - Newton\'s Laws',
      uploadDate: '2024-10-22',
      status: 'completed',
      formats: ['summary', 'quiz'],
      thumbnail: '⚛️'
    }
  ];

  const formatIcons = {
    mindmap: '🗺️',
    summary: '📄',
    audio: '🎙️',
    quiz: '❓'
  };

  const formatLabels = {
    mindmap: 'Mind Map',
    summary: 'Summary',
    audio: 'Audio',
    quiz: 'Quiz'
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'processing':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'failed':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'processing':
        return 'Processing...';
      case 'failed':
        return 'Failed';
      default:
        return 'Unknown';
    }
  };

  // Filter results
  const filteredResults = allResults.filter(result => {
    const matchesStatus = filterStatus === 'all' || result.status === filterStatus;
    const matchesSearch = result.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Your Transformations</h1>
          <p className="text-gray-600">View and access all your transformed learning materials</p>
        </div>

        {/* Filters and Search */}
        <div className="card mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Search Bar */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by title..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <svg
                  className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>

            {/* Status Filter */}
            <div className="flex gap-2">
              {['all', 'completed', 'processing'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    filterStatus === status
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-4">
          <p className="text-gray-600">
            Showing {filteredResults.length} {filteredResults.length === 1 ? 'result' : 'results'}
          </p>
        </div>

        {/* Results Grid */}
        {filteredResults.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResults.map((result) => (
              <Link
                key={result.id}
                to={`/results/${result.id}`}
                state={{ title: result.title, uploadDate: result.uploadDate }}
                className="card hover:shadow-lg transition-shadow cursor-pointer group"
              >
                {/* Thumbnail */}
                <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg p-8 mb-4 flex items-center justify-center group-hover:from-purple-100 group-hover:to-blue-100 transition-colors">
                  <div className="text-6xl">{result.thumbnail}</div>
                </div>

                {/* Content */}
                <div className="space-y-3">
                  <h3 className="text-lg font-bold text-gray-900 group-hover:text-purple-600 transition-colors">
                    {result.title}
                  </h3>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">
                      {new Date(result.uploadDate).toLocaleDateString()}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                        result.status
                      )}`}
                    >
                      {getStatusText(result.status)}
                    </span>
                  </div>

                  {/* Formats */}
                  {result.formats.length > 0 ? (
                    <div>
                      <p className="text-xs text-gray-500 mb-2">Available formats:</p>
                      <div className="flex flex-wrap gap-2">
                        {result.formats.map((format) => (
                          <span
                            key={format}
                            className="inline-flex items-center px-2 py-1 bg-purple-50 text-purple-700 rounded text-xs font-medium"
                            title={formatLabels[format]}
                          >
                            <span className="mr-1">{formatIcons[format]}</span>
                            {formatLabels[format]}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500 italic">No formats available yet</div>
                  )}

                  {/* View Button */}
                  <div className="pt-2">
                    <div className="btn-primary text-center text-sm w-full">
                      View Details →
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="card text-center py-12">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No results found</h3>
            <p className="text-gray-600 mb-6">
              {searchQuery
                ? 'Try adjusting your search or filters'
                : 'Upload some content to get started'}
            </p>
            <Link to="/upload" className="btn-primary inline-block">
              Upload Content
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}