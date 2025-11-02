import React from 'react';
import MindMapViewer from './MindMapViewer';

export default function TransformationModal({ isOpen, onClose, type, data, loading }) {
  if (!isOpen) return null;

  const getModalContent = () => {
    switch (type) {
      case 'mindmap':
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">🗺️ Mind Map</h2>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <svg className="animate-spin h-12 w-12 text-purple-600 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <p className="text-gray-600">Generating your mind map...</p>
                </div>
              </div>
            ) : data ? (
              <MindMapViewer mindMapData={data} />
            ) : (
              <p className="text-gray-600">No data available</p>
            )}
          </div>
        );

      case 'visual':
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">📊 Visual Learning</h2>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <svg className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <p className="text-gray-600">Creating visual representations...</p>
                </div>
              </div>
            ) : (
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-12 text-center">
                <div className="text-6xl mb-4">📊</div>
                <p className="text-gray-700 font-semibold mb-2">Charts & Diagrams</p>
                <p className="text-gray-600 text-sm">Visual content will appear here</p>
              </div>
            )}
          </div>
        );

      case 'audio':
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">🎙️ Audio Narration</h2>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <svg className="animate-spin h-12 w-12 text-green-600 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <p className="text-gray-600">Generating audio narration...</p>
                </div>
              </div>
            ) : (
              <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-lg p-12 text-center">
                <div className="text-6xl mb-4">🎙️</div>
                <p className="text-gray-700 font-semibold mb-2">Podcast-Style Narration</p>
                <p className="text-gray-600 text-sm">Audio player will appear here</p>
                <div className="mt-6">
                  <div className="bg-white rounded-full h-2 overflow-hidden max-w-md mx-auto">
                    <div className="bg-green-600 h-full w-0"></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case 'quiz':
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">❓ Interactive Quiz</h2>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <svg className="animate-spin h-12 w-12 text-orange-600 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <p className="text-gray-600">Generating quiz questions...</p>
                </div>
              </div>
            ) : (
              <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-lg p-12 text-center">
                <div className="text-6xl mb-4">❓</div>
                <p className="text-gray-700 font-semibold mb-2">Test Your Knowledge</p>
                <p className="text-gray-600 text-sm">Interactive quiz will appear here</p>
              </div>
            )}
          </div>
        );

      default:
        return <p>Unknown transformation type</p>;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex-1">{/* Spacer */}</div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close modal"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-6">
          {getModalContent()}
          
          <div className="mt-6 flex gap-4 justify-end">
            {!loading && data && (
              <>
                <button className="btn-secondary">
                  Download
                </button>
                <button className="btn-secondary">
                  Regenerate
                </button>
              </>
            )}
            <button onClick={onClose} className="btn-primary">
              {loading ? 'Processing...' : 'Close'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
