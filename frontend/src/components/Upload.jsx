import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import MindMapViewer from './MindMapViewer';

const API_BASE_URL = 'http://localhost:5000';

export default function Upload() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mindMapData, setMindMapData] = useState(null);
  const [showMindMap, setShowMindMap] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const allowedFormats = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Validate file type
    if (!allowedFormats.includes(selectedFile.type)) {
      setError('Only PDF and DOCX files are supported');
      setFile(null);
      return;
    }

    // Validate file size (max 10MB)
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      setFile(null);
      return;
    }

    setFile(selectedFile);
    setError('');
    setShowMindMap(false);
    setMindMapData(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      const event = {
        target: { files: [droppedFile] }
      };
      handleFileChange(event);
    }
  };

  const handleGenerateMindMap = async () => {
    setError('');

    if (!file) {
      setError('Please select a file first');
      return;
    }

    setLoading(true);
    setShowMindMap(false);
    setMindMapData(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_BASE_URL}/api/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate mind map');
      }

      const data = await response.json();
      setMindMapData(data);
      setShowMindMap(true);
    } catch (err) {
      setError(err.message || 'Failed to generate mind map. Please try again.');
      console.error('Mind map generation error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Upload Your Content</h1>
          <p className="text-gray-600">
            Upload a document and generate an AI-powered mind map
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Upload */}
          <div className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {/* File Upload Section */}
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Step 1: Choose Your File</h2>
              
              <div
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
                  file
                    ? 'border-green-300 bg-green-50'
                    : 'border-gray-300 hover:border-purple-300 hover:bg-purple-50'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.docx"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {file ? (
                  <>
                    <svg className="w-12 h-12 text-green-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-green-700 font-semibold">{file.name}</p>
                    <p className="text-sm text-green-600 mt-1">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFile(null);
                        setShowMindMap(false);
                        setMindMapData(null);
                      }}
                      className="text-sm text-green-600 hover:text-green-700 mt-2 underline"
                    >
                      Change file
                    </button>
                  </>
                ) : (
                  <>
                    <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="text-gray-900 font-semibold">Drag and drop your file here</p>
                    <p className="text-gray-600 text-sm mt-1">or click to browse</p>
                    <p className="text-gray-500 text-xs mt-2">
                      Supported formats: PDF, DOCX (max 10MB)
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* Generate Button */}
            {file && (
              <div className="card">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Step 2: Generate Mind Map</h2>
                <p className="text-gray-600 mb-4">
                  Click the button below to process your document and create an interactive mind map.
                </p>
                <button
                  onClick={handleGenerateMindMap}
                  disabled={loading}
                  className="btn-primary w-full"
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </span>
                  ) : (
                    '🗺️ Generate Mind Map'
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Right Column - Mind Map Display */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Mind Map Preview</h2>
            
            {showMindMap && mindMapData ? (
              <div className="space-y-4">
                <MindMapViewer mindMapData={mindMapData} />
                <div className="flex gap-4">
                  <button
                    onClick={() => {
                      setFile(null);
                      setShowMindMap(false);
                      setMindMapData(null);
                    }}
                    className="btn-secondary flex-1"
                  >
                    Upload Another File
                  </button>
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="btn-primary flex-1"
                  >
                    Back to Dashboard
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg p-12 flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                  <div className="text-6xl mb-4">🗺️</div>
                  <p className="text-gray-700 font-semibold mb-2">Your Mind Map Will Appear Here</p>
                  <p className="text-gray-600 text-sm">
                    {file ? 'Click "Generate Mind Map" to start processing' : 'Upload a file to get started'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}