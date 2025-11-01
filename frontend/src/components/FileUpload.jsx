import { useState, useCallback } from 'react';
import { UploadCloud, File as FileIcon, X } from 'lucide-react';
import MindMap from './MindMap'; // Import the new component

const FileUpload = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const [mindMapData, setMindMapData] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file && (file.type === 'application/pdf' || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')) {
      setSelectedFile(file);
      setError(null);
    } else {
      setError('Invalid file type. Please upload a PDF or DOCX file.');
    }
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    if (file && (file.type === 'application/pdf' || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')) {
      setSelectedFile(file);
      setError(null);
    } else {
      setError('Invalid file type. Please upload a PDF or DOCX file.');
    }
  }, []);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };
  
  const handleRemoveFile = () => {
    setSelectedFile(null);
    setMindMapData(null);
  };

  const handleGenerateClick = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setError(null);
    setMindMapData(null);

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await fetch('http://localhost:5000/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Something went wrong.');
      setMindMapData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto mt-10">
      {/* File Upload Section (no changes here) */}
      <div 
        className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center bg-gray-800 hover:border-blue-500 transition-colors"
        onDrop={handleDrop} onDragOver={handleDragOver}
      >
        <input type="file" id="file-upload" className="hidden" onChange={handleFileChange} accept=".pdf,.docx" />
        {!selectedFile ? (
          <>
            <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
            <label htmlFor="file-upload" className="mt-4 text-sm font-medium text-blue-400 cursor-pointer">
              <span>Upload a file</span>
            </label>
            <p className="mt-1 text-xs text-gray-500">or drag and drop</p>
            <p className="mt-2 text-xs text-gray-500">PDF or DOCX</p>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center">
             <FileIcon className="h-12 w-12 text-blue-400" />
             <p className="mt-2 text-sm font-medium text-gray-300">{selectedFile.name}</p>
             <button onClick={handleRemoveFile} className="mt-4 text-sm text-red-400 hover:text-red-500 font-semibold flex items-center">
                <X className="h-4 w-4 mr-1" />
                Remove
             </button>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-4 text-center text-red-400 bg-red-900/30 p-3 rounded-lg">
            <p>{error}</p>
        </div>
      )}

      <div className="mt-6">
        <button
          onClick={handleGenerateClick}
          disabled={!selectedFile || isUploading}
          className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg shadow-lg transition duration-200 enabled:hover:bg-blue-700 disabled:bg-gray-500 disabled:cursor-not-allowed"
        >
          {isUploading ? 'Generating...' : 'Generate Mind Map'}
        </button>
      </div>

      
      {mindMapData && <MindMap data={mindMapData} />}
    </div>
  );
};

export default FileUpload;

