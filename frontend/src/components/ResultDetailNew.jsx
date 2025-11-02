import React, { useEffect, useRef, useState } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import TransformationModal from './TransformationModal';

const API_BASE_URL = 'http://localhost:5000';

export default function ResultDetail() {
  const { id } = useParams();
  const location = useLocation();
  const storageKey = id ? `adapted:project:${id}` : null;
  const storedProjectRef = useRef(null);

  if (storedProjectRef.current === null && typeof window !== 'undefined' && storageKey) {
    try {
      const raw = window.localStorage.getItem(storageKey);
      storedProjectRef.current = raw ? JSON.parse(raw) : null;
    } catch (err) {
      console.warn('Failed to load stored project', err);
      storedProjectRef.current = null;
    }
  }
  
  const navigationState = location.state || {};
  const file = navigationState.file;

  const createDefaultTransformationState = () => ({
    mindmap: { generated: false, data: null },
    visual: { generated: false, data: null },
    audio: { generated: false, data: null },
    quiz: { generated: false, data: null }
  });

  const hydrateTransformations = (stored) => {
    const base = createDefaultTransformationState();
    if (!stored) return base;

    return {
      mindmap: { ...base.mindmap, ...(stored.mindmap || {}) },
      visual: { ...base.visual, ...(stored.visual || {}) },
      audio: { ...base.audio, ...(stored.audio || {}) },
      quiz: { ...base.quiz, ...(stored.quiz || {}) }
    };
  };

  const [metadata, setMetadata] = useState(() => {
    if (navigationState && (navigationState.title || navigationState.fileName)) {
      return {
        title: navigationState.title || 'Untitled Upload',
        fileName: navigationState.fileName || 'Unknown file',
        fileSize: navigationState.fileSize ?? null,
        uploadDate: navigationState.uploadDate || new Date().toISOString()
      };
    }

    if (storedProjectRef.current?.metadata) {
      return storedProjectRef.current.metadata;
    }

    return {
      title: 'Untitled Upload',
      fileName: 'Unknown file',
      fileSize: null,
      uploadDate: null
    };
  });
  
  const [activeTab, setActiveTab] = useState('mindmap');
  const [transformations, setTransformations] = useState(() =>
    hydrateTransformations(storedProjectRef.current?.transformations)
  );
  
  const [modalState, setModalState] = useState({
    isOpen: false,
    type: null,
    data: null,
    loading: false
  });

  useEffect(() => {
    if (!storageKey || typeof window === 'undefined') return;

    const payload = {
      metadata,
      transformations,
      lastUpdated: new Date().toISOString()
    };

    try {
      window.localStorage.setItem(storageKey, JSON.stringify(payload));
    } catch (err) {
      console.warn('Failed to persist project state', err);
    }
  }, [storageKey, metadata, transformations]);

  const tabs = [
    { id: 'mindmap', label: 'Mind Map', icon: '🗺️', color: 'purple' },
    { id: 'visual', label: 'Visual Learning', icon: '📊', color: 'blue' },
    { id: 'audio', label: 'Audio Narration', icon: '🎙️', color: 'green' },
    { id: 'quiz', label: 'Quiz', icon: '❓', color: 'orange' }
  ];

  const handleGenerate = async (type) => {
    if (!file) {
      alert('File not found. Please upload again.');
      return;
    }

    setModalState({ isOpen: true, type, data: null, loading: true });

    try {
      const formData = new FormData();
      formData.append('file', file);

      let endpoint = '';
      switch (type) {
        case 'mindmap':
          endpoint = '/api/upload';
          break;
        case 'audio':
          endpoint = '/api/audio';  // TODO: Implement in backend
          break;
        case 'quiz':
          endpoint = '/api/quiz';   // TODO: Implement in backend
          break;
        case 'visual':
          endpoint = '/api/visual'; // TODO: Implement in backend
          break;
        default:
          throw new Error('Unknown transformation type');
      }

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Generation failed');
      }

      const data = await response.json();
      
      // Update transformations state
      setTransformations(prev => ({
        ...prev,
        [type]: { generated: true, data }
      }));

      setModalState({ isOpen: true, type, data, loading: false });
    } catch (err) {
      alert(`Failed to generate ${type}: ${err.message}`);
      setModalState({ isOpen: false, type: null, data: null, loading: false });
    }
  };

  const closeModal = () => {
    setModalState({ isOpen: false, type: null, data: null, loading: false });
  };

  const getTabColorClasses = (color, isActive) => {
    const colors = {
      purple: isActive ? 'text-purple-600 border-purple-600' : 'text-gray-600',
      blue: isActive ? 'text-blue-600 border-blue-600' : 'text-gray-600',
      green: isActive ? 'text-green-600 border-green-600' : 'text-gray-600',
      orange: isActive ? 'text-orange-600 border-orange-600' : 'text-gray-600'
    };
    return colors[color] || colors.purple;
  };

  const getButtonColorClasses = (color) => {
    const colors = {
      purple: 'bg-purple-600 hover:bg-purple-700',
      blue: 'bg-blue-600 hover:bg-blue-700',
      green: 'bg-green-600 hover:bg-green-700',
      orange: 'bg-orange-600 hover:bg-orange-700'
    };
    return colors[color] || colors.purple;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">{metadata.title || 'Untitled Upload'}</h1>
              <p className="text-gray-600">
                {metadata.fileName}
                {metadata.fileSize ? ` • ${(metadata.fileSize / 1024 / 1024).toFixed(2)} MB` : ''}
                {metadata.uploadDate ? ` • Uploaded ${new Date(metadata.uploadDate).toLocaleDateString()}` : ''}
              </p>
            </div>
            <Link to="/results" className="btn-secondary">
              ← Back to All Results
            </Link>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <div className="flex space-x-8">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-3 px-2 font-medium transition-colors border-b-2 ${
                  activeTab === tab.id
                    ? getTabColorClasses(tab.color, true)
                    : getTabColorClasses(tab.color, false) + ' border-transparent hover:text-gray-900'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
                {transformations[tab.id].generated && (
                  <span className="ml-2 inline-block w-2 h-2 bg-green-500 rounded-full"></span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content Area */}
          <div className="lg:col-span-2">
            <div className="card">
              {tabs.map(tab => (
                activeTab === tab.id && (
                  <div key={tab.id}>
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-2xl font-bold text-gray-900">
                        {tab.icon} {tab.label}
                      </h2>
                      {transformations[tab.id].generated && (
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                          ✓ Generated
                        </span>
                      )}
                    </div>

                    {!transformations[tab.id].generated ? (
                      <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg p-12 text-center">
                        <div className="text-6xl mb-4">{tab.icon}</div>
                        <p className="text-gray-700 font-semibold mb-2">
                          Ready to Generate {tab.label}?
                        </p>
                        <p className="text-gray-600 text-sm mb-6">
                          Click the button below to transform your content
                        </p>
                        {!file && (
                          <p className="text-sm text-red-500 mb-4">
                            Upload again if you need to regenerate fresh output.
                          </p>
                        )}
                        <button
                          onClick={() => handleGenerate(tab.id)}
                          className={`px-6 py-3 text-white rounded-lg font-medium transition-colors ${getButtonColorClasses(tab.color)}`}
                        >
                          Generate {tab.label}
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="bg-white border border-gray-200 rounded-lg p-6">
                          <div className="text-center">
                            <div className="text-4xl mb-3">{tab.icon}</div>
                            <p className="text-gray-700 font-semibold mb-2">
                              {tab.label} Generated Successfully!
                            </p>
                            <p className="text-gray-600 text-sm mb-4">
                              Click below to view in full screen
                            </p>
                            <button
                              onClick={() => setModalState({ 
                                isOpen: true, 
                                type: tab.id, 
                                data: transformations[tab.id].data, 
                                loading: false 
                              })}
                              className="btn-primary"
                            >
                              View Full Screen
                            </button>
                          </div>
                        </div>
                        
                        <div className="flex gap-4">
                          <button
                            onClick={() => handleGenerate(tab.id)}
                            className="btn-secondary flex-1"
                          >
                            Regenerate
                          </button>
                          <button className="btn-secondary flex-1">
                            Download
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="card mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Progress</h3>
              <div className="space-y-3">
                {tabs.map(tab => (
                  <div key={tab.id} className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">{tab.icon} {tab.label}</span>
                    {transformations[tab.id].generated ? (
                      <span className="text-green-600 text-sm font-medium">✓ Done</span>
                    ) : (
                      <span className="text-gray-400 text-sm">Not generated</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Quick Actions</h3>
              <div className="space-y-2">
                <button className="w-full btn-secondary text-sm">
                  Download All
                </button>
                <Link to="/upload" className="block w-full btn-secondary text-sm text-center">
                  Upload Another File
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Transformation Modal */}
      <TransformationModal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        type={modalState.type}
        data={modalState.data}
        loading={modalState.loading}
      />
    </div>
  );
}
