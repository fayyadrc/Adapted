import React, { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';

export default function ResultDetail() {
  const { id } = useParams();
  const location = useLocation();
  const title = location.state?.title;
  const selectedFormats = location.state?.selectedFormats;

  // Mock data - replace with real API data
  const allFormats = {
    mindmap: {
      type: 'Mind Map',
      description: 'Interactive mind map showing the photosynthesis process',
      content: 'Light Reactions → Calvin Cycle → Glucose Production',
      icon: '🗺️'
    },
    summary: {
      type: 'Summary',
      description: 'Concise summary of your content',
      icon: '📄'
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
      result.formats.mindmap = allFormats.mindmap;
      result.formats.summary = allFormats.summary;
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

  const [bookmarked, setBookmarked] = useState(false);
  const [activeTab, setActiveTab] = useState('');
  const [savedItems, setSavedItems] = useState([]);

  useEffect(() => {
    const formatKeys = Object.keys(result.formats);
    if (formatKeys.length > 0) {
      setActiveTab(formatKeys[0]);
    }
  }, [location.state]);

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
              {activeTab === 'mindmap' && (
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-3">
                    {result.formats.mindmap.type}
                  </h2>
                  <p className="text-gray-600 mb-4">
                    {result.formats.mindmap.description}
                  </p>

                  {/* Mock Visual Content */}
                  <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg p-6 mb-4 h-48 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-4xl mb-3">🗺️</div>
                      <p className="text-gray-700 font-semibold mb-2">Mind Map Preview</p>
                      <p className="text-gray-600 text-sm">{result.formats.mindmap.content}</p>
                      <div className="mt-4 text-xs text-gray-500">
                        Interactive mind map will be displayed here
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button
                      onClick={() => handleDownload('mindmap')}
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

              {activeTab === 'summary' && (
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-3">
                    {result.formats.summary.type}
                  </h2>
                  <p className="text-gray-600 mb-4">
                    {result.formats.summary.description}
                  </p>

                  {/* Mock Summary Content */}
                  <div className="bg-white rounded-lg p-6 mb-4 border border-gray-200">
                    <div className="prose max-w-none">
                      <h3 className="text-lg font-semibold mb-3">Key Points</h3>
                      <ul className="space-y-2 text-gray-700">
                        <li>Photosynthesis is the process by which plants convert light energy into chemical energy</li>
                        <li>The process occurs in two main stages: light reactions and the Calvin cycle</li>
                        <li>Light reactions take place in the thylakoid membranes and produce ATP and NADPH</li>
                        <li>The Calvin cycle uses ATP and NADPH to fix carbon dioxide into glucose</li>
                      </ul>
                      <div className="mt-4 text-xs text-gray-500">
                        AI-generated summary will be displayed here
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button
                      onClick={() => handleDownload('summary')}
                      className="btn-secondary flex-1"
                    >
                      Download PDF
                    </button>
                    <button
                      onClick={() => console.log('Copy functionality to be implemented')}
                      className="btn-primary flex-1"
                    >
                      Copy Text
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

                  {/* Mock Audio Content */}
                  <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg p-6 mb-4">
                    <div className="text-center">
                      <div className="text-4xl mb-3">🎙️</div>
                      <p className="text-gray-700 font-semibold mb-2">Audio Narration</p>
                      <p className="text-gray-600 text-sm">Duration: {result.formats.audio.duration}</p>
                      <div className="mt-4">
                        <div className="bg-white rounded-full h-2 overflow-hidden">
                          <div className="bg-purple-600 h-full w-0"></div>
                        </div>
                      </div>
                      <div className="mt-4 text-xs text-gray-500">
                        Audio player will be displayed here
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button
                      onClick={() => handleDownload('audio')}
                      className="btn-secondary flex-1"
                    >
                      Download MP3
                    </button>
                    <button
                      onClick={() => console.log('Play functionality to be implemented')}
                      className="btn-primary flex-1"
                    >
                      Play
                    </button>
                  </div>
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

                  {/* Mock Quiz Content */}
                  <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg p-6 mb-4">
                    <div className="text-center">
                      <div className="text-4xl mb-3">❓</div>
                      <p className="text-gray-700 font-semibold mb-2">Interactive Quiz</p>
                      <p className="text-gray-600 text-sm">{result.formats.quiz.questionCount} Questions</p>
                      <div className="mt-4 text-xs text-gray-500">
                        Quiz interface will be displayed here
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button
                      onClick={() => handleDownload('quiz')}
                      className="btn-secondary flex-1"
                    >
                      Download PDF
                    </button>
                    <button
                      onClick={() => console.log('Start quiz functionality to be implemented')}
                      className="btn-primary flex-1"
                    >
                      Start Quiz
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="card mb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Quick Actions</h3>
              <div className="space-y-2">
                <button
                  onClick={() => handleDownload('all')}
                  className="w-full btn-secondary text-sm"
                >
                  Download All Formats
                </button>
                <Link
                  to="/results"
                  className="block w-full btn-secondary text-sm text-center"
                >
                  Back to Results
                </Link>
              </div>
            </div>

            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Upload Date:</span>
                  <span className="font-medium">{new Date(result.uploadDate).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="font-medium text-green-600">Completed</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Formats:</span>
                  <span className="font-medium">{Object.keys(result.formats).length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
