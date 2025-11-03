import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
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
  Image
} from 'lucide-react';
import MindMapViewer from './MindMapViewer';

// Mock API base URL. In a real app, this would come from apiService.js
const API_BASE_URL = 'http://localhost:5000';

export default function Upload() {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [generatedResult, setGeneratedResult] = useState(null);
  const fileInputRef = useRef(null);

  // State for format selection (Q2, Q6)
  const [selectedFormats, setSelectedFormats] = useState({
    visual: {
      mindmap: false,
      chart: false,
      diagram: false,
      infographic: false,
    },
    audio: false,
    quiz: false,
  });
  const [showVisualSubOptions, setShowVisualSubOptions] = useState(false);

  // Mock user assessment data (Q8)
  const userAssessment = { recommended: ['visual'] };

  const allowedFormats = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
  ];

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!allowedFormats.includes(selectedFile.type)) {
      setError('Only PDF, DOCX, and TXT files are supported');
      setFile(null);
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      setFile(null);
      return;
    }

    setFile(selectedFile);
    // Auto-fill title with filename (Q3)
    setTitle(selectedFile.name.replace(/\.[^/.]+$/, ''));
    setError('');
    setGeneratedResult(null); // Clear previous result
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

  // Helper to check if any format is selected
  const isAnyFormatSelected = () => {
    if (selectedFormats.audio || selectedFormats.quiz) return true;
    return Object.values(selectedFormats.visual).some((isSelected) => isSelected);
  };

  // Main submission handler
  const handleGenerate = async () => {
    setError('');
    if (!file || !title || !isAnyFormatSelected()) {
      setError('Please upload a file, set a title, and select at least one format.');
      return;
    }

    setLoading(true);
    setGeneratedResult(null);

    // Create a clean object of selected formats to send to backend
    const formatsToGenerate = [];
    if (selectedFormats.audio) formatsToGenerate.push('audio');
    if (selectedFormats.quiz) formatsToGenerate.push('quiz');
    
    // Only add "visual" if a sub-option is selected
    if (Object.values(selectedFormats.visual).some(Boolean)) {
      formatsToGenerate.push('visual');
    }
    // You could also send the detailed visual object:
    // const formatsToGenerate = {
    //   ...selectedFormats,
    //   visual: selectedFormats.visual.mindmap ? 'mindmap' : null, // etc.
    // };

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', title);
      formData.append('formats', JSON.stringify(formatsToGenerate)); // Send formats

      const response = await fetch(`${API_BASE_URL}/api/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate content');
      }

      const data = await response.json();
      const enrichedResult = {
        ...data,
        uploadedAt: new Date().toISOString(),
      };
      setGeneratedResult(enrichedResult); // (Q1)
    } catch (err) {
      setError(err.message || 'Failed to generate. Please try again.');
      console.error('Generation error:', err);
    } finally {
      setLoading(false); // (Q9)
    }
  };

  // --- Format Selection Handlers ---

  const handleFormatClick = (formatKey) => {
    if (formatKey === 'visual') {
      // Toggle sub-options (Q6)
      setShowVisualSubOptions(!showVisualSubOptions);
    } else {
      // Handle "Coming Soon" for other formats (Q7)
      alert('Coming Soon');
      // Optionally toggle it anyway
      // setSelectedFormats(prev => ({
      //   ...prev,
      //   [formatKey]: !prev[formatKey]
      // }));
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
      // Handle "Coming Soon" for sub-options (Q7)
      alert('Coming Soon');
    }
  };

  const isRecommended = (key) => userAssessment.recommended.includes(key);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header (Q10) */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Transform Your Notes</h1>
          <p className="text-gray-600">
            Upload a document and select the study formats you want to create.
          </p>
        </div>

        {/* Two-column layout (Q4) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* --- Left Column: Steps 1, 2, and Actions --- */}
          <div className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {/* Step 1: Choose File */}
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
                  accept=".pdf,.docx,.txt"
                  onChange={handleFileChange}
                  className="hidden"
                />
                {file ? (
                  <>
                    <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-2" />
                    <p className="text-green-700 font-semibold">{file.name}</p>
                    <p className="text-sm text-green-600 mt-1">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFile(null);
                        setTitle('');
                        setGeneratedResult(null);
                      }}
                      className="text-sm text-green-600 hover:text-green-700 mt-2 underline"
                    >
                      Change file
                    </button>
                  </>
                ) : (
                  <>
                    <UploadCloud className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-900 font-semibold">Drag and drop your file here</p>
                    <p className="text-gray-600 text-sm mt-1">or click to browse</p>
                    <p className="text-gray-500 text-xs mt-2">
                      Supported: PDF, DOCX, TXT (max 10MB)
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* Step 2: Name Your Content (Q3) */}
            {file && (
              <div className="card">
                <label htmlFor="title" className="text-xl font-semibold text-gray-900 mb-4 block">
                  Step 2: Name Your Content
                </label>
                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="input-field"
                  placeholder="e.g., Biology Chapter 3 Notes"
                />
              </div>
            )}

            {/* Generate Button */}
            {file && title && (
              <button
                onClick={handleGenerate}
                disabled={loading || !isAnyFormatSelected()}
                className="btn-primary w-full"
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
            )}

            {/* View Result Link (Q1) */}
            {generatedResult && (
              <div className="card bg-green-50 border-green-200">
                <h3 className="text-lg font-bold text-green-800 mb-2">Success!</h3>
                <p className="text-green-700 mb-4">Your new study materials are ready.</p>
                <Link
                  to={`/results/${generatedResult.id}`}
                  state={{ ...generatedResult }} 
                  className="btn-primary w-full text-center"
                >
                  View Results →
                </Link>
              </div>
            )}
          </div>

          {/* --- Right Column: Step 3 --- */}
          <div className="space-y-6">
            {/* Step 3: Choose Formats (Q5) */}
            {file && title && (
              <div className="card">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Step 3: Choose Your Formats
                </h2>
                <div className="space-y-4">
                  
                  {/* Visual Learning Card (Q6, Q8) */}
                  <FormatCard
                    title="Visual Learning"
                    description="Mind maps, charts, and diagrams"
                    icon={Brain}
                    color="purple"
                    onClick={() => handleFormatClick('visual')}
                    isRecommended={isRecommended('visual')}
                    isSelected={showVisualSubOptions}
                  />

                  {/* Visual Sub-Options (Q6) */}
                  {showVisualSubOptions && (
                    <div className="pl-8 -mt-2 space-y-2 animate-fade-in">
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
                        title="Infographics"
                        icon={BarChart2}
                        onClick={() => handleSubOptionClick('chart')}
                        isSelected={selectedFormats.visual.chart}
                        isComingSoon={true}
                      />
                      {/* Add more sub-options here */}
                    </div>
                  )}

                  {/* Audio Learning Card */}
                  <FormatCard
                    title="Audio Generation"
                    description="Convert notes to a podcast"
                    icon={Headphones}
                    color="blue"
                    onClick={() => handleFormatClick('audio')}
                    isRecommended={isRecommended('audio')}
                    isSelected={selectedFormats.audio}
                    isComingSoon={true}
                  />

                  {/* Quiz Generation Card */}
                  <FormatCard
                    title="Quiz Generation"
                    description="Create practice questions"
                    icon={FileQuestion}
                    color="green"
                    onClick={() => handleFormatClick('quiz')}
                    isRecommended={isRecommended('quiz')}
                    isSelected={selectedFormats.quiz}
                    isComingSoon={true}
                  />

                </div>
              </div>
            )}

            {generatedResult?.formats?.visual && (
              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">Mind Map Preview</h2>
                  <span className="text-xs font-semibold uppercase tracking-wide text-purple-600 bg-purple-100 px-2 py-1 rounded-full">
                    Generated
                  </span>
                </div>

                {generatedResult.formats.visual.error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    {generatedResult.formats.visual.error}
                  </div>
                )}

                {!generatedResult.formats.visual.error && generatedResult.formats.visual.data && (
                  <MindMapViewer mindMapData={generatedResult.formats.visual.data} />
                )}

                {!generatedResult.formats.visual.error && !generatedResult.formats.visual.data && (
                  <p className="text-sm text-gray-600">
                    Your mind map is processing. Check back in a moment.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Reusable Card Components for Format Selection ---

const FormatCard = ({ title, description, icon: Icon, color, onClick, isSelected, isRecommended, isComingSoon }) => (
  <button
    onClick={onClick}
    className={`relative w-full p-4 rounded-lg border-2 text-left transition-all ${
      isSelected
        ? `border-${color}-500 bg-${color}-50`
        : 'border-gray-200 hover:border-gray-300'
    } ${isComingSoon ? 'opacity-60' : ''}`}
  >
    {isRecommended && (
      <span className="absolute -top-3 -right-3 flex items-center px-2 py-1 bg-yellow-400 text-yellow-900 rounded-full text-xs font-bold">
        <Sparkles className="w-3 h-3 mr-1" />
        Recommended
      </span>
    )}
    {isComingSoon && !isSelected && (
      <span className="absolute top-2 right-2 px-2 py-1 bg-gray-500 text-white rounded-full text-xs font-bold">
        Soon
      </span>
    )}
    
    <div className="flex items-center">
      <div className={`w-12 h-12 rounded-lg bg-${color}-100 flex items-center justify-center mr-4`}>
        <Icon className={`w-6 h-6 text-${color}-600`} />
      </div>
      <div className="flex-1">
        <h3 className={`font-semibold text-gray-900`}>{title}</h3>
        <p className={`text-sm text-gray-600`}>{description}</p>
      </div>
      <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${isSelected ? 'rotate-90' : ''}`} />
    </div>
  </button>
);

const SubOptionCard = ({ title, icon: Icon, onClick, isSelected, isComingSoon }) => (
  <button
    onClick={onClick}
    className={`w-full p-3 rounded-lg text-left transition-all flex items-center ${
      isSelected
        ? 'bg-purple-100'
        : 'hover:bg-gray-100'
    } ${isComingSoon ? 'opacity-60' : ''}`}
  >
    <Icon className="w-5 h-5 text-purple-600 mr-3" />
    <span className="flex-1 font-medium text-gray-800 text-sm">{title}</span>
    {isComingSoon && (
      <span className="px-2 py-0.5 bg-gray-500 text-white rounded-full text-xs font-bold">
        Soon
      </span>
    )}
    {!isComingSoon && (
      <div className={`w-5 h-5 rounded-md flex items-center justify-center border-2 ${
        isSelected
          ? 'bg-purple-600 border-purple-600'
          : 'border-gray-300'
      }`}>
        {isSelected && <CheckCircle className="w-4 h-4 text-white" />}
      </div>
    )}
  </button>
);

// Helper style for animation (add to your index.css or App.css)
/*
@keyframes fade-in {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in {
  animation: fade-in 0.3s ease-out;
}
*/