import { useState, useCallback } from 'react';
import { UploadCloud, File as FileIcon, X } from 'lucide-react';

const DashboardFileUpload = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file && (
      file.type === 'application/pdf' || 
      file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      file.type === 'text/plain'
    )) {
      setSelectedFile(file);
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
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Title Section */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Upload your file</h2>
        <p className="text-gray-600">Upload your learning material and convert it to different formats</p>
      </div>

      {/* Upload Learning Material Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex items-center mb-4">
          <UploadCloud className="w-5 h-5 text-gray-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-800">Upload Learning Material</h3>
        </div>
        
        <div 
          className={`border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300 ${
            isDragOver 
              ? 'border-purple-400 bg-purple-50' 
              : selectedFile 
                ? 'border-green-400 bg-green-50' 
                : 'border-gray-300 bg-gray-50 hover:border-purple-400 hover:bg-purple-50'
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
              <div className="w-16 h-16 mx-auto mb-4 bg-purple-100 rounded-full flex items-center justify-center">
                <UploadCloud className="w-8 h-8 text-purple-500" />
              </div>
              <p className="text-lg font-medium text-gray-700 mb-2">
                Drag and drop your files here, or click to browse
              </p>
              <p className="text-sm text-gray-500 mb-4">Supports PDF, DOC, TXT files</p>
              <label 
                htmlFor="file-upload" 
                className="inline-flex items-center px-6 py-3 bg-purple-600 text-white font-medium rounded-lg cursor-pointer hover:bg-purple-700 transition-colors"
              >
                Browse Files
              </label>
            </>
          ) : (
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                <FileIcon className="w-8 h-8 text-green-500" />
              </div>
              <p className="text-lg font-medium text-gray-700 mb-2">{selectedFile.name}</p>
              <p className="text-sm text-gray-500 mb-4">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
              <button 
                onClick={handleRemoveFile} 
                className="inline-flex items-center px-4 py-2 text-red-600 hover:text-red-700 font-medium transition-colors"
              >
                <X className="w-4 h-4 mr-1" />
                Remove File
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardFileUpload;