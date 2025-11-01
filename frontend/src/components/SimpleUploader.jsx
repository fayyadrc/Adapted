import { useState, useCallback } from 'react';
import { UploadCloud, FileText, Brain, Headphones, Play, X, ChevronRight, BarChart3 } from 'lucide-react';
import { Link } from 'react-router-dom';
import MindMap from './MindMap';

const SimpleUploader = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedFormat, setSelectedFormat] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [mindMapData, setMindMapData] = useState(null);
  const [error, setError] = useState(null);

  const formats = [
    {
      id: 'mindmap',
      title: 'Mind Map',
      description: 'Visual diagram of your content',
      icon: Brain,
      color: 'purple',
      example: 'Great for seeing connections'
    },
    {
      id: 'summary',
      title: 'Summary',
      description: 'Key points in bullet format',
      icon: FileText,
      color: 'blue',
      example: 'Perfect for quick review'
    },
    {
      id: 'audio',
      title: 'Audio',
      description: 'Listen to your content',
      icon: Headphones,
      color: 'green',
      example: 'Study while walking'
    }
  ];

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file && (
      file.type === 'application/pdf' || 
      file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      file.type === 'text/plain'
    )) {
      setSelectedFile(file);
      setSelectedFormat(null);
    }
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file && (
      file.type === 'application/pdf' || 
      file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      file.type === 'text/plain'
    )) {
      setSelectedFile(file);
      setSelectedFormat(null);
    }
  }, []);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };
  
  const handleRemoveFile = () => {
    setSelectedFile(null);
    setSelectedFormat(null);
    setMindMapData(null);
    setError(null);
  };

  const handleGenerate = async () => {
    if (!selectedFile || !selectedFormat) return;
    
    setIsProcessing(true);
    setError(null);
    setMindMapData(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await fetch('http://localhost:5000/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong.');
      }

      // For now, only handle mind map format from backend
      if (selectedFormat.id === 'mindmap') {
        setMindMapData(data);
      } else {
        // For other formats, show a placeholder message
        alert(`${selectedFormat.title} feature coming soon! Currently only Mind Maps are supported.`);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* Main Title */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Turn your notes into something better
        </h1>
        <p className="text-gray-600">
          Upload any document and choose how you want to study it
        </p>
      </div>

      {/* Step 1: File Upload */}
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
            <span className="text-purple-600 font-bold">1</span>
          </div>
          <h2 className="text-xl font-semibold text-gray-800">Upload your file</h2>
        </div>
        
        <div 
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
            isDragOver 
              ? 'border-purple-400 bg-purple-50' 
              : selectedFile 
                ? 'border-green-400 bg-green-50' 
                : 'border-gray-300 hover:border-purple-400'
          }`}
          onDrop={handleDrop} 
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <input 
            type="file" 
            id="file-upload" 
            className="hidden" 
            onChange={handleFileChange} 
            accept=".pdf,.docx,.txt" 
          />
          
          {!selectedFile ? (
            <>
              <UploadCloud className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-700 mb-2">
                Drop your file here or click to browse
              </p>
              <p className="text-sm text-gray-500 mb-4">PDF, Word, or Text files</p>
              <label 
                htmlFor="file-upload" 
                className="inline-block px-6 py-3 bg-purple-600 text-white font-medium rounded-lg cursor-pointer hover:bg-purple-700 transition-colors"
              >
                Choose File
              </label>
            </>
          ) : (
            <div className="flex items-center justify-center">
              <FileText className="w-8 h-8 text-green-600 mr-3" />
              <div className="text-left">
                <p className="font-medium text-gray-800">{selectedFile.name}</p>
                <p className="text-sm text-gray-500">
                  {(selectedFile.size / 1024 / 1024).toFixed(1)} MB
                </p>
              </div>
              <button 
                onClick={handleRemoveFile} 
                className="ml-4 p-1 text-red-500 hover:text-red-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Step 2: Choose Format (only show if file is uploaded) */}
      {selectedFile && (
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
              <span className="text-purple-600 font-bold">2</span>
            </div>
            <h2 className="text-xl font-semibold text-gray-800">Choose your format</h2>
          </div>
          
          <div className="space-y-3">
            {formats.map((format) => {
              const IconComponent = format.icon;
              const isSelected = selectedFormat?.id === format.id;
              
              return (
                <button
                  key={format.id}
                  onClick={() => setSelectedFormat(format)}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                    isSelected 
                      ? `border-${format.color}-400 bg-${format.color}-50` 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center">
                    <div className={`w-10 h-10 rounded-lg bg-${format.color}-100 flex items-center justify-center mr-4`}>
                      <IconComponent className={`w-5 h-5 text-${format.color}-600`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800">{format.title}</h3>
                      <p className="text-sm text-gray-600">{format.description}</p>
                      <p className="text-xs text-gray-500 mt-1">{format.example}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Generate Button */}
      {selectedFile && selectedFormat && (
        <button
          onClick={handleGenerate}
          disabled={isProcessing}
          className="w-full py-4 bg-purple-600 text-white font-semibold rounded-xl hover:bg-purple-700 disabled:bg-gray-400 transition-colors flex items-center justify-center"
        >
          {isProcessing ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Creating your {selectedFormat.title}...
            </>
          ) : (
            <>
              <Play className="w-5 h-5 mr-2" />
              Create {selectedFormat.title}
            </>
          )}
        </button>
      )}

      {/* Error Display */}
      {error && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-red-700 font-medium">Error</p>
          <p className="text-red-600 text-sm mt-1">{error}</p>
        </div>
      )}

      {/* Mind Map Display */}
      {mindMapData && (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-gray-800">Your Mind Map</h3>
            <button
              onClick={() => setMindMapData(null)}
              className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <MindMap data={mindMapData} />
          </div>
        </div>
      )}

      {/* Assessment CTA - only show if no mind map is displayed */}
      {!mindMapData && (
        <div className="mt-12 p-6 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-100">
          <div className="flex items-center mb-3">
            <BarChart3 className="w-6 h-6 text-purple-600 mr-3" />
            <h3 className="text-lg font-semibold text-gray-800">Get Personalized Recommendations</h3>
          </div>
          <p className="text-gray-600 mb-4">
            Take our quick assessment and we'll suggest the best learning formats based on your strengths!
          </p>
          <Link
            to="/assessment"
            className="inline-flex items-center px-6 py-3 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors"
          >
            Take Assessment
            <ChevronRight className="w-4 h-4 ml-2" />
          </Link>
        </div>
      )}
    </div>
  );
};

export default SimpleUploader;