import { useState, useRef } from 'react';
import { UploadCloud, File as FileIcon, X } from 'lucide-react';

function FileUpload() {
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      setFile(droppedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      console.log("No file selected.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      
      const formData = new FormData();
      formData.append('file', file);

      // Make API call to backend
      const response = await fetch('http://localhost:5000/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const mindmapData = await response.json();
        console.log("Mind map generated successfully:", mindmapData);
        // TODO: Handle the mindmap data (display it, store it, etc.)
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to generate mind map');
        console.error("Error generating mind map:", errorData.error);
      }
    } catch (error) {
      setError('Network error: Unable to connect to server');
      console.error("Network error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const selectFile = () => {
    fileInputRef.current?.click();
  };

  const removeFile = () => {
    setFile(null);
  };

  return (
    <div className="w-full max-w-lg mx-auto">
      <div
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={selectFile}
        className={`bg-gray-800 border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300 ease-in-out
          ${isDragging ? 'border-blue-500 bg-gray-700' : 'border-gray-600 hover:border-blue-500 hover:bg-gray-700'}
        `}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept=".pdf,.docx"
        />
        <div className="flex flex-col items-center justify-center space-y-4 text-gray-400">
          <UploadCloud size={48} className="text-gray-500" />
          <p className="text-lg font-semibold">
            <span className="text-blue-500">Click to upload</span> or drag and drop
          </p>
          <p className="text-sm">PDF or DOCX files</p>
        </div>
      </div>

      {file && (
        <div className="mt-6">
          <div className="bg-gray-800 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FileIcon className="text-gray-400" size={24} />
              <span className="text-white font-medium truncate">{file.name}</span>
            </div>
            <button onClick={removeFile} className="text-gray-500 hover:text-white p-1 rounded-full">
              <X size={20} />
            </button>
          </div>

          <button
            onClick={handleUpload}
            disabled={isLoading}
            className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg shadow-lg transition duration-200 disabled:bg-gray-500 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Generating Mind Map...' : 'Generate Mind Map'}
          </button>

          {error && (
            <div className="mt-4 bg-red-900 border border-red-700 text-red-100 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default FileUpload;

