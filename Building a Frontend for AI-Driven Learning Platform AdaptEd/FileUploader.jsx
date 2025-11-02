import { useState, useCallback } from 'react';
import { UploadCloud, FileText, Brain, Headphones, Play, X, ChevronRight, BarChart3 } from 'lucide-react';
import { Link } from 'react-router-dom';
import MindMap from './MindMap';

const FileUploader = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedFormat, setSelectedFormat] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [mindMapData, setMindMapData] = useState(null);
  const [summaryData, setSummaryData] = useState(null);
  const [quizData, setQuizData] = useState(null);
  const [error, setError] = useState(null);

  const formats = [
    {
      id: 'visual',
      title: 'Visual Learning',
      description: 'Mind maps, diagrams, and visual content',
      icon: Brain,
      color: 'purple',
      example: 'Perfect for visual learners'
    },
    {
      id: 'audio',
      title: 'Audio Learning',
      description: 'Podcasts, summaries, and audio content',
      icon: Headphones,
      color: 'blue',
      example: 'Great for auditory learners'
    },
    {
      id: 'quiz',
      title: 'Quiz Generation',
      description: 'Interactive quizzes and practice questions',
      icon: FileText,
      color: 'green',
      example: 'Test your knowledge'
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
      setError(null); 
    } else if (file) {
      setError('Please upload a PDF, Word document, or text file.');
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
      setError(null); 
    } else if (file) {
      setError('Please upload a PDF, Word document, or text file.');
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
    setSummaryData(null);
    setQuizData(null);
    setError(null);
  };

  const handleGenerate = async () => {
    if (!selectedFile || !selectedFormat) return;
    
    setIsProcessing(true);
    setError(null);
    setMindMapData(null);
    setSummaryData(null);
    setQuizData(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      let endpoint = '';
      if (selectedFormat.id === 'visual') {
        endpoint = 'http://localhost:5000/api/upload';
      } else if (selectedFormat.id === 'audio') {
        endpoint = 'http://localhost:5000/api/generate-summary';
      } else if (selectedFormat.id === 'quiz') {
        endpoint = 'http://localhost:5000/api/generate-quiz';
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong.');
      }

      
      if (selectedFormat.id === 'visual') {
        setMindMapData(data);
      } else if (selectedFormat.id === 'audio') {
        setSummaryData(data);
      } else if (selectedFormat.id === 'quiz') {
        setQuizData(data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Turn your notes into something better
        </h1>
        <p className="text-gray-600">
          Upload any document and choose how you want to study it
        </p>
      </div>

      
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
            <h2 className="text-xl font-semibold text-gray-800">Choose your learning format</h2>
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

      {/* Summary Display */}
      {summaryData && (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-gray-800">Summary</h3>
            <button
              onClick={() => setSummaryData(null)}
              className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-3">{summaryData.title}</h4>
            <p className="text-gray-700 mb-4 leading-relaxed">{summaryData.summary}</p>
            
            <h5 className="font-semibold text-gray-800 mb-3">Key Points:</h5>
            <ul className="space-y-2 mb-4">
              {summaryData.key_points?.map((point, index) => (
                <li key={index} className="flex items-start">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span className="text-gray-700">{point}</span>
                </li>
              ))}
            </ul>
            
            {summaryData.example && (
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h6 className="font-medium text-blue-800 mb-2">Example:</h6>
                <p className="text-blue-700">{summaryData.example}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Quiz Display */}
      {quizData && (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-gray-800">Interactive Quiz</h3>
            <button
              onClick={() => setQuizData(null)}
              className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-2">{quizData.title}</h4>
            <p className="text-gray-600 mb-6">{quizData.description}</p>
            
            <div className="space-y-6">
              {quizData.questions?.map((question, qIndex) => (
                <div key={qIndex} className="p-4 bg-gray-50 rounded-lg">
                  <h5 className="font-medium text-gray-800 mb-3">
                    {qIndex + 1}. {question.question}
                  </h5>
                  <div className="space-y-2">
                    {question.options?.map((option, oIndex) => (
                      <label key={oIndex} className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          name={`question-${qIndex}`}
                          className="mr-3 text-purple-600 focus:ring-purple-500"
                        />
                        <span className="text-gray-700">{option}</span>
                      </label>
                    ))}
                  </div>
                  <div className="mt-3 p-3 bg-green-50 rounded border-l-4 border-green-400">
                    <p className="text-sm text-green-700">
                      <strong>Answer:</strong> {question.options?.[question.correct_answer]}
                    </p>
                    <p className="text-sm text-green-600 mt-1">{question.explanation}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Assessment CTA - only show if no content is displayed */}
      {!mindMapData && !summaryData && !quizData && (
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

export default FileUploader;