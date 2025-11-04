import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FileText, Calendar, Eye, Trash2, Brain, FileQuestion, BookText } from 'lucide-react';

// Helper function to load results from localStorage
const loadResultsFromLocalStorage = () => {
  try {
    const results = JSON.parse(localStorage.getItem('adapted:results') || '[]');
    return results;
  } catch (error) {
    console.error('Failed to load results from localStorage:', error);
    return [];
  }
};

// Helper function to delete a result from localStorage
const deleteResultFromLocalStorage = (id) => {
  try {
    const results = JSON.parse(localStorage.getItem('adapted:results') || '[]');
    const filtered = results.filter(r => r.id !== id);
    localStorage.setItem('adapted:results', JSON.stringify(filtered));
    return filtered;
  } catch (error) {
    console.error('Failed to delete result from localStorage:', error);
    return [];
  }
};

export default function Results() {
  const navigate = useNavigate();
  const [results, setResults] = useState([]);

  useEffect(() => {
    // Load results from localStorage
    const savedResults = loadResultsFromLocalStorage();
    setResults(savedResults);
  }, []);

  const handleDelete = (id, e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this result?')) {
      const updatedResults = deleteResultFromLocalStorage(id);
      setResults(updatedResults);
    }
  };

  const handleViewResult = (result) => {
    navigate(`/results/${result.id}`, { state: result });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getFormatIcon = (formatKey) => {
    switch(forwmatKey) {
      case 'visual':
        return <Brain className="w-4 h-4" />;
      case 'quiz':
        return <FileQuestion className="w-4 h-4" />;
      case 'reports':
        return <BookText className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const getFormatBadgeColor = (formatKey) => {
    switch(formatKey) {
      case 'visual':
        return 'bg-purple-100 text-purple-700';
      case 'quiz':
        return 'bg-blue-100 text-blue-700';
      case 'reports':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getFormatLabel = (formatKey) => {
    switch(formatKey) {
      case 'visual':
        return 'Mind Map';
      case 'quiz':
        return 'Quiz';
      case 'reports':
        return 'Summary';
      default:
        return formatKey;
    }
  };

  if (results.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-3">No results yet</h1>
            <p className="text-gray-600 mb-6">
              Upload and generate content to see your results here.
            </p>
            <Link to="/upload" className="inline-flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
              Upload Content
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Results</h1>
          <p className="text-gray-600">
            View and manage all your generated content ({results.length} {results.length === 1 ? 'result' : 'results'})
          </p>
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Formats
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {results.map((result) => (
                <tr 
                  key={result.id}
                  className="hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => handleViewResult(result)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <FileText className="w-5 h-5 text-gray-400 mr-3" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {result.title}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="w-4 h-4 mr-2" />
                      {formatDate(result.uploadedAt)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-2">
                      {Object.keys(result.formats || {}).map((formatKey) => (
                        <span
                          key={formatKey}
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getFormatBadgeColor(formatKey)}`}
                        >
                          {getFormatIcon(formatKey)}
                          <span className="ml-1">{getFormatLabel(formatKey)}</span>
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewResult(result);
                      }}
                      className="text-purple-600 hover:text-purple-900 mr-4"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                    <button
                      onClick={(e) => handleDelete(result.id, e)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-4">
          {results.map((result) => (
            <div
              key={result.id}
              className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handleViewResult(result)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center flex-1">
                  <FileText className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" />
                  <h3 className="text-sm font-medium text-gray-900 line-clamp-2">
                    {result.title}
                  </h3>
                </div>
              </div>
              
              <div className="flex items-center text-sm text-gray-500 mb-3">
                <Calendar className="w-4 h-4 mr-2" />
                {formatDate(result.uploadedAt)}
              </div>

              <div className="flex flex-wrap gap-2 mb-3">
                {Object.keys(result.formats || {}).map((formatKey) => (
                  <span
                    key={formatKey}
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getFormatBadgeColor(formatKey)}`}
                  >
                    {getFormatIcon(formatKey)}
                    <span className="ml-1">{getFormatLabel(formatKey)}</span>
                  </span>
                ))}
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleViewResult(result);
                  }}
                  className="flex items-center px-3 py-1.5 text-sm text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                >
                  <Eye className="w-4 h-4 mr-1" />
                  View
                </button>
                <button
                  onClick={(e) => handleDelete(result.id, e)}
                  className="flex items-center px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}