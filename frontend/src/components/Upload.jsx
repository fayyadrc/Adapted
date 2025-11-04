import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  CheckCircle,
  Loader2,
  Brain,
  Headphones,
  FileQuestion,
  Sparkles,
  ChevronRight,
  BookText,
  BarChart2,
  Image,
  Video,
  FileText,
  Layers,
  Edit2,
  X,
  Maximize2,
  Minimize2
} from 'lucide-react';
import MindMapViewer from './MindMapViewer';
import QuizViewer from './QuizViewer';
import api from '../services/apiService';

export default function Upload() {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [generatedResult, setGeneratedResult] = useState(null);
  const [expandedCard, setExpandedCard] = useState(null);
  const [showMindMapModal, setShowMindMapModal] = useState(false);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [isMindMapMinimized, setIsMindMapMinimized] = useState(false);
  const fileInputRef = useRef(null);

  // State for format selection
  const [selectedFormats, setSelectedFormats] = useState({
    visual: {
      mindmap: false,
      chart: false,
      diagram: false,
      infographic: false,
    },
    audio: false,
    video: false,
    quiz: false,
    flashcards: false,
    reports: false,
  });
  const [showVisualSubOptions, setShowVisualSubOptions] = useState(false);

  // Mock user assessment data
  const userAssessment = { recommended: ['visual'] };

  const allowedFormats = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!allowedFormats.includes(selectedFile.type)) {
      setError('Only PDF and DOCX files are supported');
      setFile(null);
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      setFile(null);
      return;
    }

    setFile(selectedFile);
    setTitle(selectedFile.name.replace(/\.[^/.]+$/, ''));
    setError('');
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
      handleFileChange({ target: { files: [droppedFile] } });
    }
  };

  const isAnyFormatSelected = () => {
    if (selectedFormats.audio || selectedFormats.quiz || selectedFormats.video || 
        selectedFormats.flashcards || selectedFormats.reports) return true;
    return Object.values(selectedFormats.visual).some((isSelected) => isSelected);
  };

  // FIXED: Main submission handler with proper data structure handling
  const handleGenerate = async () => {
    setError('');
    if (!file || !title || !isAnyFormatSelected()) {
      setError('Please upload a file, set a title, and select at least one format.');
      return;
    }

    setLoading(true);

    const formatsToGenerate = [];
    if (selectedFormats.audio) formatsToGenerate.push('audio');
    if (selectedFormats.quiz) formatsToGenerate.push('quiz');
    if (selectedFormats.video) formatsToGenerate.push('video');
    if (selectedFormats.flashcards) formatsToGenerate.push('flashcards');
    if (selectedFormats.reports) formatsToGenerate.push('reports');
    
    if (Object.values(selectedFormats.visual).some(Boolean)) {
      formatsToGenerate.push('visual');
    }

    try {
      console.log('=== UPLOAD DEBUG ===');
      console.log('Selected formats:', selectedFormats);
      console.log('Formats to generate:', formatsToGenerate);
      
      const data = await api.uploadFile(file, title, formatsToGenerate);
      console.log('Raw backend response:', data);
      
      // FIXED: Properly structure the result based on backend response
      const enrichedResult = {
        id: data?.id || `local-${Date.now()}`,
        title: title,
        uploadedAt: new Date().toISOString(),
        formats: {}
      };

      // Handle visual/mindmap format
      if (selectedFormats.visual.mindmap) {
        // Check if backend returned the unified structure
        if (data?.formats?.visual?.data) {
          enrichedResult.formats.visual = {
            type: data.formats.visual.type || 'Mind Map',
            description: data.formats.visual.description || 'Interactive mind map',
            data: data.formats.visual.data,
            error: data.formats.visual.error
          };
        }
        // Or if it returned just the mind map data directly
        else if (data.root) {
          enrichedResult.formats.visual = {
            type: 'Mind Map',
            description: 'Interactive mind map showing key concepts',
            data: data  // The whole response is the mind map
          };
        }
      }

      // Handle audio format
      if (selectedFormats.audio && data?.formats?.audio) {
        enrichedResult.formats.audio = data.formats.audio;
      }

      // Handle quiz format  
      if (selectedFormats.quiz && data?.formats?.quiz) {
        enrichedResult.formats.quiz = data.formats.quiz;
      }

      console.log('Enriched result structure:', enrichedResult);
      console.log('Has visual data?', !!enrichedResult?.formats?.visual?.data);
      console.log('Visual data content:', enrichedResult?.formats?.visual?.data);
      
      setGeneratedResult(enrichedResult);
      
      // FIXED: Show mind map modal if visual/mindmap was selected AND we have data
      if (selectedFormats.visual.mindmap && enrichedResult?.formats?.visual?.data) {
        console.log('✅ Opening mind map modal');
        setShowMindMapModal(true);
        setIsMindMapMinimized(false);
      } else {
        console.log('❌ NOT opening mind map modal');
        console.log('  - mindmap selected:', selectedFormats.visual.mindmap);
        console.log('  - has visual format:', !!enrichedResult?.formats?.visual);
        console.log('  - has visual data:', !!enrichedResult?.formats?.visual?.data);
      }
      
    } catch (err) {
      console.error('❌ Generation error:', err);
      setError(err.message || 'Failed to generate. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Format Selection Handlers
  const handleFormatClick = (formatKey) => {
    if (formatKey === 'visual') {
      setShowVisualSubOptions(!showVisualSubOptions);
    } else if (formatKey === 'audio' || formatKey === 'video' || formatKey === 'flashcards') {
      alert('Coming Soon');
    } else if (formatKey === 'reports' || formatKey === 'quiz') {
      setSelectedFormats(prev => ({
        ...prev,
        [formatKey]: !prev[formatKey]
      }));
    }
  };

  const handleSubOptionClick = (subOptionKey) => {
    if (subOptionKey === 'mindmap') {
      setSelectedFormats((prev) => ({
        ...prev,
        visual: {
          ...prev.visual,
          [subOptionKey]: !prev.visual[subOptionKey],
        },
      }));
    } else {
      alert('Coming Soon');
    }
  };

  const isRecommended = (key) => userAssessment.recommended.includes(key);

  const handleMinimizeMindMap = () => {
    setIsMindMapMinimized(true);
  };

  const handleMaximizeMindMap = () => {
    setIsMindMapMinimized(false);
  };

  const handleCloseMindMap = () => {
    setShowMindMapModal(false);
    setIsMindMapMinimized(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Mind Map Modal - Full Screen */}
        {showMindMapModal && !isMindMapMinimized && generatedResult?.formats?.visual?.data && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full h-full max-w-7xl max-h-[90vh] flex flex-col">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Mind Map: {title}</h2>
                  <p className="text-sm text-gray-500">Interactive visualization of your content</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleMinimizeMindMap}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    aria-label="Minimize"
                  >
                    <Minimize2 className="w-5 h-5 text-gray-600" />
                  </button>
                  <button
                    onClick={handleCloseMindMap}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    aria-label="Close"
                  >
                    <X className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-hidden">
                {generatedResult.formats.visual.error ? (
                  <div className="p-6">
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                      {generatedResult.formats.visual.error}
                    </div>
                  </div>
                ) : (
                  <MindMapViewer mindMapData={generatedResult.formats.visual.data} />
                )}
              </div>
            </div>
          </div>
        )}

        {/* Quiz Modal */}
        {showQuizModal && generatedResult?.formats?.quiz?.data && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full h-full max-w-4xl max-h-[90vh] flex flex-col">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Quiz: {title}</h2>
                  <p className="text-sm text-gray-500">Test your knowledge</p>
                </div>
                <button
                  onClick={() => setShowQuizModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  aria-label="Close"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">
                <QuizViewer quizData={generatedResult.formats.quiz.data} />
              </div>
            </div>
          </div>
        )}

        {/* Upload Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Upload & Transform</h1>
              <p className="text-gray-600">
                Upload your document and select the formats you want to generate
              </p>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* File Upload Card */}
            <div className="lg:col-span-1">
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">1. Choose File</h3>
                <div
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${
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
                      <CheckCircle className="w-10 h-10 text-green-600 mx-auto mb-2" />
                      <p className="text-green-700 font-semibold text-sm">{file.name}</p>
                      <p className="text-xs text-green-600 mt-1">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setFile(null);
                          setTitle('');
                        }}
                        className="text-xs text-green-600 hover:text-green-700 mt-2 underline"
                      >
                        Change file
                      </button>
                    </>
                  ) : (
                    <>
                      <UploadCloud className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-900 font-medium text-sm">Drop file here</p>
                      <p className="text-gray-600 text-xs mt-1">or click to browse</p>
                      <p className="text-gray-500 text-xs mt-2">PDF, DOCX (max 10MB)</p>
                    </>
                  )}
                </div>

                {file && (
                  <div className="mt-4">
                    <label htmlFor="title" className="text-sm font-medium text-gray-700 mb-2 block">
                      2. Name Your Content
                    </label>
                    <input
                      id="title"
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="e.g., Biology Chapter 3"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Format Selection Card */}
            {file && title && (
              <div className="lg:col-span-2">
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">3. Select Formats</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                    <FormatSelectionCard
                      title="Visual Learning"
                      description="Mind maps & diagrams"
                      icon={Brain}
                      color="purple"
                      onClick={() => handleFormatClick('visual')}
                      isRecommended={isRecommended('visual')}
                      isSelected={showVisualSubOptions}
                    />

                    <FormatSelectionCard
                      title="Audio Overview"
                      description="Listen to your notes"
                      icon={Headphones}
                      color="blue"
                      onClick={() => handleFormatClick('audio')}
                      isRecommended={isRecommended('audio')}
                      isSelected={selectedFormats.audio}
                      isComingSoon={true}
                    />

                    <FormatSelectionCard
                      title="Video Overview"
                      description="Visual explanations"
                      icon={Video}
                      color="indigo"
                      onClick={() => handleFormatClick('video')}
                      isRecommended={isRecommended('video')}
                      isSelected={selectedFormats.video}
                      isComingSoon={true}
                    />

                    <FormatSelectionCard
                      title="Reports"
                      description="Detailed summaries"
                      icon={FileText}
                      color="emerald"
                      onClick={() => handleFormatClick('reports')}
                      isRecommended={isRecommended('reports')}
                      isSelected={selectedFormats.reports}
                    />

                    <FormatSelectionCard
                      title="Flashcards"
                      description="Study cards"
                      icon={Layers}
                      color="amber"
                      onClick={() => handleFormatClick('flashcards')}
                      isRecommended={isRecommended('flashcards')}
                      isSelected={selectedFormats.flashcards}
                      isComingSoon={true}
                    />

                    <FormatSelectionCard
                      title="Quiz"
                      description="Practice questions"
                      icon={FileQuestion}
                      color="cyan"
                      onClick={() => handleFormatClick('quiz')}
                      isRecommended={isRecommended('quiz')}
                      isSelected={selectedFormats.quiz}
                    />

                  </div>

                  {/* Visual Sub-Options */}
                  {showVisualSubOptions && (
                    <div className="mt-4 pl-4 space-y-2 animate-fade-in">
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
                        Visual Types
                      </p>
                      <SubOptionCard
                        title="Mind Map"
                        icon={BookText}
                        onClick={() => handleSubOptionClick('mindmap')}
                        isSelected={selectedFormats.visual.mindmap}
                      />
                      <SubOptionCard
                        title="Chart"
                        icon={BarChart2}
                        onClick={() => handleSubOptionClick('chart')}
                        isSelected={selectedFormats.visual.chart}
                        isComingSoon={true}
                      />
                      <SubOptionCard
                        title="Diagram"
                        icon={Image}
                        onClick={() => handleSubOptionClick('diagram')}
                        isSelected={selectedFormats.visual.diagram}
                        isComingSoon={true}
                      />
                      <SubOptionCard
                        title="Infographic"
                        icon={Sparkles}
                        onClick={() => handleSubOptionClick('infographic')}
                        isSelected={selectedFormats.visual.infographic}
                        isComingSoon={true}
                      />
                    </div>
                  )}

                  <button
                    onClick={handleGenerate}
                    disabled={loading || !isAnyFormatSelected()}
                    className="w-full mt-6 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-500/25"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center">
                        <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5" />
                        Generating...
                      </span>
                    ) : (
                      'Generate Content'
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Generated Content Section */}
        {generatedResult && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Generated Content</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Minimized Mind Map Card */}
              {generatedResult?.formats?.visual?.data && (
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200 rounded-lg p-4 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Brain className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 text-sm">Mind Map</h4>
                        <p className="text-xs text-gray-600">{title}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleMaximizeMindMap}
                        className="p-2 hover:bg-white/50 rounded-lg transition-colors"
                        aria-label="Maximize"
                      >
                        <Maximize2 className="w-4 h-4 text-purple-600" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Quiz Card */}
              {generatedResult?.formats?.quiz?.data && (
                <div
                  onClick={() => setShowQuizModal(true)}
                  className="bg-gradient-to-br from-cyan-50 to-cyan-100 border-2 border-cyan-200 rounded-lg p-4 animate-fade-in cursor-pointer hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center">
                        <FileQuestion className="w-5 h-5 text-cyan-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 text-sm">Quiz</h4>
                        <p className="text-xs text-gray-600">{generatedResult.formats.quiz.data.questions.length} questions</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <ChevronRight className="w-4 h-4 text-cyan-600" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Reusable Card Components
const FormatSelectionCard = ({ title, description, icon: Icon, color, onClick, isSelected, isRecommended, isComingSoon }) => (
  <button
    onClick={onClick}
    className={`relative p-4 rounded-lg border text-left transition-all ${
      isSelected
        ? `border-${color}-400 bg-${color}-50`
        : 'border-gray-200 hover:border-gray-300 bg-white'
    } ${isComingSoon ? 'opacity-70' : ''}`}
  >
    {isRecommended && (
      <span className="absolute -top-2 -right-2 flex items-center px-2 py-1 bg-yellow-400 text-yellow-900 rounded-full text-xs font-bold">
        <Sparkles className="w-3 h-3 mr-1" />
        Recommended
      </span>
    )}
    {isComingSoon && !isSelected && (
      <span className="absolute top-2 right-2 px-2 py-1 bg-gray-200 text-gray-600 rounded-full text-xs font-semibold">
        Soon
      </span>
    )}
    
    <div className="flex items-center">
      <div className={`w-10 h-10 rounded-lg bg-${color}-100 flex items-center justify-center mr-3`}>
        <Icon className={`w-5 h-5 text-${color}-600`} />
      </div>
      <div className="flex-1">
        <h3 className="font-semibold text-gray-900 text-sm">{title}</h3>
        <p className="text-xs text-gray-600">{description}</p>
      </div>
      <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${isSelected ? 'rotate-90' : ''}`} />
    </div>
  </button>
);

const SubOptionCard = ({ title, icon: Icon, onClick, isSelected, isComingSoon }) => (
  <button
    onClick={onClick}
    className={`w-full p-2.5 rounded-lg text-left transition-all flex items-center ${
      isSelected
        ? 'bg-purple-50 border border-purple-200'
        : 'hover:bg-gray-50 border border-transparent'
    } ${isComingSoon ? 'opacity-60' : ''}`}
  >
    <Icon className="w-4 h-4 text-purple-600 mr-3" />
    <span className="flex-1 font-medium text-gray-800 text-sm">{title}</span>
    {isComingSoon && (
      <span className="px-2 py-0.5 bg-gray-200 text-gray-600 rounded-full text-xs font-semibold">
        Soon
      </span>
    )}
    {!isComingSoon && (
      <div className={`w-4 h-4 rounded flex items-center justify-center border ${
        isSelected
          ? 'bg-purple-600 border-purple-600'
          : 'border-gray-300'
      }`}>
        {isSelected && <CheckCircle className="w-3 h-3 text-white" />}
      </div>
    )}
  </button>
);