import React, { useState } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';

export default function Results() {
  const { id } = useParams();
  const location = useLocation();
  const title = location.state?.title;
  const selectedFormats = location.state?.selectedFormats;
  const [bookmarked, setBookmarked] = useState(false);
  const [activeTab, setActiveTab] = useState(Object.keys(result.formats)[0]);
  const [savedItems, setSavedItems] = useState([]);

  // Mock data - replace with real API data
  const allFormats = {
    visual: {
      type: 'Mind Map',
      description: 'Interactive mind map showing the photosynthesis process',
      content: 'Light Reactions → Calvin Cycle → Glucose Production',
      icon: '🗺️'
    },
    audio: {
      type: 'Podcast Narration',
      description: 'Professional narration of your content',
      duration: '8:45',
      icon: '🎙️'
    },
    quiz: {
      type: 'Interactive Quiz',
      description: 'Test your understanding with AI-generated questions',
      questionCount: 12,
      icon: '❓'
    }
  };

  const result = {
    id: id || '1',
    title: title || 'Biology Chapter 3 - Photosynthesis',
    uploadDate: '2024-11-01',
    status: 'completed',
    formats: {}
  };

  if (selectedFormats) {
    if (selectedFormats.visual && Object.values(selectedFormats.visual).some(Boolean)) {
      result.formats.visual = allFormats.visual;
    }
    if (selectedFormats.audio) {
      result.formats.audio = allFormats.audio;
    }
    if (selectedFormats.quiz) {
      result.formats.quiz = allFormats.quiz;
    }
  } else {
    result.formats = allFormats;
  }

  const handleBookmark = () => {
    setBookmarked(!bookmarked);
    if (!bookmarked) {
      setSavedItems([...savedItems, result.id]);
    } else {
      setSavedItems(savedItems.filter(item => item !== result.id));
    }
  };

  const handleDownload = (format) => {
    // Mock download functionality
    console.log(`Downloading ${format} for ${result.id}`);
    alert(`Downloaded ${format} format!`);
  };

  const handleShare = () => {
    // Mock share functionality
    console.log(`Sharing result ${result.id}`);
    alert('Share link copied to clipboard!');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header with Bookmark */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">{result.title}</h1>
            <p className="text-gray-600 text-sm">
              Uploaded {new Date(result.uploadDate).toLocaleDateString()} • Status: <span className="text-green-600 font-semibold">Completed</span>
            </p>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={handleBookmark}
              className={`p-2 rounded-lg transition-colors ${
                bookmarked
                  ? 'bg-purple-100 text-purple-600'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              title="Bookmark this result"
            >
              <svg className="w-5 h-5" fill={bookmarked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h6a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            </button>
            
            <button
              onClick={handleShare}
              className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
              title="Share this result"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C9.589 12.938 10 12.502 10 12c0-.502-.411-.938-1.316-1.342m0 2.684a3 3 0 110-2.684m9.032-6.674l-9.032 4.026m0 7.288l9.032-4.026M5.106 18.894l7.572-4.297m0-6.882l-7.572 4.297" />
              </svg>
            </button>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="border-b border-gray-200 mb-4">
          <div className="flex space-x-8">
            {Object.keys(result.formats).map(format => (
              <button
                key={format}
                onClick={() => setActiveTab(format)}
                className={`py-3 px-2 font-medium transition-colors border-b-2 ${
                  activeTab === format
                    ? 'text-purple-600 border-purple-600'
                    : 'text-gray-600 border-transparent hover:text-gray-900'
                }`}
              >
                <span className="mr-2">{result.formats[format].icon}</span>
                {format.charAt(0).toUpperCase() + format.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="card">
              {activeTab === 'visual' && (
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-3">
                    {result.formats.visual.type}
                  </h2>
                  <p className="text-gray-600 mb-4">
                    {result.formats.visual.description}
                  </p>

                  {/* Mock Visual Content */}
                  <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg p-6 mb-4 h-48 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-4xl mb-3">🗺️</div>
                      <p className="text-gray-700 font-semibold mb-2">Mind Map Preview</p>
                      <p className="text-gray-600 text-sm">{result.formats.visual.content}</p>
                      <div className="mt-4 text-xs text-gray-500">
                        Interactive mind map will be displayed here
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button
                      onClick={() => handleDownload('visual')}
                      className="btn-secondary flex-1"
                    >
                      Download
                    </button>
                    <button
                      onClick={() => console.log('Full screen functionality to be implemented')}
                      className="btn-primary flex-1"
                    >
                      Full Screen
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'audio' && (
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-3">
                    {result.formats.audio.type}
                  </h2>
                  <p className="text-gray-600 mb-4">
                    {result.formats.audio.description}
                  </p>

                  {/* Mock Audio Player */}
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-6 mb-4 h-48 flex items-center justify-center">
                    <div className="w-full max-w-md">
                      <div className="flex items-center justify-center space-x-4 mb-4">
                        <button className="w-12 h-12 bg-green-600 hover:bg-green-700 text-white rounded-full flex items-center justify-center transition-colors">
                          <svg className="w-6 h-6 ml-1" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </button>
                      </div>
                      <div className="bg-gray-300 h-2 rounded-full mb-2"></div>
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>0:00</span>
                        <span>{result.formats.audio.duration}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDownload('audio')}
                    className="btn-primary w-full"
                  >
                    Download Audio (MP3)
                  </button>
                </div>
              )}

              {activeTab === 'quiz' && (
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-3">
                    {result.formats.quiz.type}
                  </h2>
                  <p className="text-gray-600 mb-4">
                    {result.formats.quiz.description}
                  </p>

                  {/* Mock Quiz Preview */}
                  <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-lg p-4 mb-4 h-48 overflow-y-auto">
                    <div className="bg-white p-3 rounded-lg border border-gray-200">
                      <p className="font-semibold text-gray-900 mb-2 text-sm">Question 1 of {result.formats.quiz.questionCount}</p>
                      <p className="text-gray-700 mb-3 text-sm">What is the primary purpose of photosynthesis?</p>
                      <div className="space-y-1">
                        {['To produce glucose', 'To absorb sunlight', 'To release oxygen', 'All of the above'].map((option, idx) => (
                          <label key={idx} className="flex items-center space-x-2 p-1 hover:bg-gray-50 rounded cursor-pointer">
                            <input type="radio" name="answer" className="w-3 h-3" />
                            <span className="text-gray-700 text-sm">{option}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDownload('quiz')}
                    className="btn-primary w-full"
                  >
                    Start Quiz
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Actions */}
            <div className="card mb-4">
              <h3 className="font-semibold text-gray-900 mb-3">Actions</h3>
              <div className="space-y-2">
                <Link
                  to="/upload"
                  className="btn-secondary w-full text-center block"
                >
                  Upload New Content
                </Link>
                <Link
                  to="/dashboard"
                  className="btn-secondary w-full text-center block"
                >
                  Back to Dashboard
                </Link>
              </div>
            </div>



            {/* Bookmarked Indicator */}
            {bookmarked && (
              <div className="mt-4 bg-purple-50 border border-purple-200 rounded-lg p-3 text-center">
                <p className="text-sm text-purple-700">
                  <span className="font-semibold">✓ Bookmarked</span>
                  <br />
                  Added to your saved items
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}