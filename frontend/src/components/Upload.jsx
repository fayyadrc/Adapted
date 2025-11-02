import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Upload() {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [selectedFormats, setSelectedFormats] = useState({
    visual: true,
    audio: true,
    quiz: true
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const allowedFormats = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  const allowedExtensions = ['.pdf', '.docx'];

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
    
    // Auto-fill title from filename
    const fileName = selectedFile.name.replace(/\.[^/.]+$/, '');
    setTitle(fileName);
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

  const handleFormatToggle = (format) => {
    setSelectedFormats(prev => ({
      ...prev,
      [format]: !prev[format]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!file) {
      setError('Please select a file');
      return;
    }

    if (!title.trim()) {
      setError('Please enter a title');
      return;
    }

    const selectedCount = Object.values(selectedFormats).filter(Boolean).length;
    if (selectedCount === 0) {
      setError('Please select at least one output format');
      return;
    }

    setLoading(true);

    try {
      // Mock API call - replace with real backend integration
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', title);
      formData.append('formats', JSON.stringify(
        Object.keys(selectedFormats).filter(key => selectedFormats[key])
      ));

      // Simulate API request
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Mock success response
      const uploadId = Math.random().toString(36).substr(2, 9);
      navigate(`/results/${uploadId}`);
    } catch (err) {
      setError('Upload failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Upload Your Content</h1>
          <p className="text-gray-600">
            Transform your study materials into personalized learning formats
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
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

          {/* Title Section */}
          {file && (
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Step 2: Name Your Upload</h2>
              
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Title
                </label>
                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="input-field"
                  placeholder="e.g., Biology Chapter 3 - Photosynthesis"
                  disabled={loading}
                />
                <p className="text-sm text-gray-600 mt-2">
                  This helps you organize and identify your transformations
                </p>
              </div>
            </div>
          )}

          {/* Format Selection */}
          {file && (
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Step 3: Choose Output Formats</h2>
              <p className="text-gray-600 mb-6">
                Select which learning style formats you'd like to generate. You can always generate more later!
              </p>

              <div className="space-y-4">
                {/* Visual Learning */}
                <label className="flex items-start space-x-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={selectedFormats.visual}
                    onChange={() => handleFormatToggle('visual')}
                    className="w-5 h-5 text-purple-600 rounded mt-1"
                    disabled={loading}
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">Visual Learning</h3>
                    <p className="text-sm text-gray-600">
                      Mind maps, charts, diagrams, and infographics to visualize concepts
                    </p>
                  </div>
                </label>

                {/* Audio Learning */}
                <label className="flex items-start space-x-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={selectedFormats.audio}
                    onChange={() => handleFormatToggle('audio')}
                    className="w-5 h-5 text-purple-600 rounded mt-1"
                    disabled={loading}
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">Audio Generation</h3>
                    <p className="text-sm text-gray-600">
                      Podcast-style narration of your content for auditory learners
                    </p>
                  </div>
                </label>

                {/* Quiz Generation */}
                <label className="flex items-start space-x-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={selectedFormats.quiz}
                    onChange={() => handleFormatToggle('quiz')}
                    className="w-5 h-5 text-purple-600 rounded mt-1"
                    disabled={loading}
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">Quiz Generation</h3>
                    <p className="text-sm text-gray-600">
                      Interactive quizzes to test your understanding and retention
                    </p>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* Submit Button */}
          {file && (
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="btn-primary flex-1"
              >
                {loading ? 'Processing...' : 'Transform Content'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setFile(null);
                  setTitle('');
                  setSelectedFormats({ visual: true, audio: true, quiz: true });
                }}
                disabled={loading}
                className="btn-secondary flex-1"
              >
                Clear
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}