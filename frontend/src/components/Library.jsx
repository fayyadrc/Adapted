import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, Calendar, Eye, Trash2, Brain, FileQuestion, BookText, Image,
  Sparkles, Search, Filter, Folder, Plus, MoreVertical, X, FolderPlus,
  ChevronLeft, Grid, List, Headphones
} from 'lucide-react';
import {
  useResults,
  useFolders,
  useDeleteResult,
  useCreateFolder,
  useDeleteFolder,
  useMoveLessonToFolder
} from '../hooks/useApi';
import {
  PageTransition,
  StaggerContainer,
  StaggerItem,
  AnimatedCard,
  AnimatedButton,
  Skeleton,
  LoadingSpinner
} from './ui/AnimatedComponents';

export default function Library({ user }) {
  const navigate = useNavigate();

  // React Query hooks - automatic caching, loading states, and mutations
  const { data: folders = [], isLoading: foldersLoading } = useFolders(user?.id);
  const { data: results = [], isLoading: resultsLoading } = useResults(user?.id);
  const deleteResultMutation = useDeleteResult();
  const createFolderMutation = useCreateFolder();
  const deleteFolderMutation = useDeleteFolder(user?.id);
  const moveLessonMutation = useMoveLessonToFolder();

  const loading = foldersLoading || resultsLoading;

  // UI states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterFormat, setFilterFormat] = useState('all');
  const [selectedFolderId, setSelectedFolderId] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  // Modal states
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [showMoveToFolderModal, setShowMoveToFolderModal] = useState(false);
  const [itemToMove, setItemToMove] = useState(null);
  const [folderMenuOpen, setFolderMenuOpen] = useState(null);

  // Drag and drop state
  const [draggedItem, setDraggedItem] = useState(null);
  const [dragOverFolder, setDragOverFolder] = useState(null);

  // Drag and drop handlers
  const handleDragStart = (e, result) => {
    e.stopPropagation();
    setDraggedItem(result);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', result.id);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setDragOverFolder(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragEnterFolder = (folderId) => {
    setDragOverFolder(folderId);
  };

  const handleDragLeaveFolder = () => {
    setDragOverFolder(null);
  };

  const handleDropOnFolder = async (e, folderId) => {
    e.preventDefault();
    e.stopPropagation();

    if (!draggedItem) return;

    try {
      await moveLessonMutation.mutateAsync({ lessonId: draggedItem.id, folderId });
    } catch (error) {
      console.error('Failed to move item:', error);
      alert(`Failed to move item: ${error.message}`);
    } finally {
      setDraggedItem(null);
      setDragOverFolder(null);
    }
  };

  // Folder handlers
  const handleCreateFolder = async (e) => {
    e.preventDefault();
    if (!newFolderName.trim() || !user) return;

    try {
      await createFolderMutation.mutateAsync({ name: newFolderName, userId: user.id });
      setNewFolderName('');
      setShowNewFolderModal(false);
    } catch (error) {
      console.error('Failed to create folder:', error);
      alert(`Failed to create folder: ${error.message}`);
    }
  };

  const handleDeleteFolder = async (e, folderId) => {
    e.stopPropagation();
    e.preventDefault();
    console.log('Delete folder clicked, folderId:', folderId);

    if (window.confirm('Are you sure you want to delete this folder? Items inside will be moved out.')) {
      try {
        console.log('Calling deleteFolderMutation...');
        await deleteFolderMutation.mutateAsync(folderId);
        console.log('Folder deleted successfully');
        if (selectedFolderId === folderId) {
          setSelectedFolderId(null);
        }
        setFolderMenuOpen(null);
      } catch (error) {
        console.error('Failed to delete folder:', error);
        alert(`Failed to delete folder: ${error.message}`);
      }
    }
  };

  // Result/Lesson handlers
  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await deleteResultMutation.mutateAsync(id);
      } catch (error) {
        console.error('Failed to delete result:', error);
        alert('Failed to delete. Please try again.');
      }
    }
  };

  const handleViewResult = (result) => {
    navigate(`/results/${result.id}`, { state: result });
  };

  const handleOpenMoveToFolder = (e, item) => {
    e.stopPropagation();
    setItemToMove(item);
    setShowMoveToFolderModal(true);
  };

  const handleMoveToFolder = async (folderId) => {
    if (!itemToMove) return;

    try {
      await moveLessonMutation.mutateAsync({ lessonId: itemToMove.id, folderId });
      setShowMoveToFolderModal(false);
      setItemToMove(null);
    } catch (error) {
      console.error('Failed to move item:', error);
      alert(`Failed to move item: ${error.message}`);
    }
  };

  const handleRemoveFromFolder = async (e, item) => {
    e.stopPropagation();
    try {
      await moveLessonMutation.mutateAsync({ lessonId: item.id, folderId: null });
    } catch (error) {
      console.error('Failed to remove from folder:', error);
    }
  };

  // Utility functions
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  const getFormatIcon = (formatKey) => {
    switch (formatKey) {
      case 'visual': return <Brain className="w-4 h-4" />;
      case 'quiz': return <FileQuestion className="w-4 h-4" />;
      case 'reports': return <BookText className="w-4 h-4" />;
      case 'infographic': return <Image className="w-4 h-4" />;
      case 'audio': return <Headphones className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getFormatBadgeColor = (formatKey) => {
    switch (formatKey) {
      case 'visual': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'quiz': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'reports': return 'bg-green-100 text-green-700 border-green-200';
      case 'infographic': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'audio': return 'bg-pink-100 text-pink-700 border-pink-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getFormatLabel = (formatKey) => {
    switch (formatKey) {
      case 'visual': return 'Mind Map';
      case 'quiz': return 'Quiz';
      case 'reports': return 'Summary';
      case 'infographic': return 'Infographic';
      case 'audio': return 'Audio';
      default: return formatKey;
    }
  };

  // Filter results based on search, format filter, and folder selection
  const filteredResults = results.filter(result => {
    const matchesSearch = result.title?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFormat = filterFormat === 'all' || (result.formats && result.formats[filterFormat]);
    const matchesFolder = selectedFolderId ? result.folder_id === selectedFolderId : true;
    return matchesSearch && matchesFormat && matchesFolder;
  });

  // Sort results by most recent for "Recently Accessed"
  const recentlyAccessedResults = [...filteredResults].sort((a, b) => {
    const dateA = new Date(a.created_at || a.uploadedAt);
    const dateB = new Date(b.created_at || b.uploadedAt);
    return dateB - dateA; // Most recent first
  }).slice(0, 6); // Show only top 6 recent items

  const selectedFolder = folders.find(f => f.id === selectedFolderId);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <LoadingSpinner size="lg" className="mx-auto mb-4" />
          <p className="text-gray-600">Loading your library...</p>
        </motion.div>
      </div>
    );
  }

  // Empty state
  if (results.length === 0 && folders.length === 0) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <motion.div
                className="w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6"
                animate={{
                  scale: [1, 1.05, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
              >
                <Sparkles className="w-12 h-12 text-purple-500" />
              </motion.div>
              <h1 className="text-3xl font-bold text-gray-900 mb-3">Start Your Learning Journey</h1>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Upload your first document and transform it into mind maps, quizzes, summaries, and more.
              </p>
              <AnimatedButton className="inline-flex items-center px-8 py-4 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-all shadow-lg hover:shadow-xl font-medium">
                <Link to="/upload" className="flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  Upload Your First Document
                </Link>
              </AnimatedButton>
            </motion.div>
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <motion.div
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div>
              {selectedFolderId ? (
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setSelectedFolderId(null)}
                    className="p-2 hover:bg-white rounded-lg transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5 text-gray-600" />
                  </button>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">{selectedFolder?.name || 'Folder'}</h1>
                    <p className="text-gray-600">
                      {filteredResults.length} {filteredResults.length === 1 ? 'item' : 'items'}
                    </p>
                  </div>
                </div>
              ) : (
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Your Library</h1>
                  <p className="text-gray-600">
                    {results.length} {results.length === 1 ? 'document' : 'documents'} • {folders.length} {folders.length === 1 ? 'folder' : 'folders'}
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              <AnimatedButton
                onClick={() => setShowNewFolderModal(true)}
                className="inline-flex items-center px-4 py-2.5 border border-gray-300 bg-white text-gray-700 rounded-xl hover:bg-gray-50 transition-colors text-sm font-medium"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Folder
              </AnimatedButton>
              <Link
                to="/upload"
                state={{ folderId: selectedFolderId }}
              >
                <AnimatedButton className="inline-flex items-center px-4 py-2.5 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors text-sm font-medium">
                  <Plus className="w-4 h-4 mr-2" />
                  New Upload
                </AnimatedButton>
              </Link>
            </div>
          </motion.div>

          {/* Search and Filter Bar */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search documents..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              {/* Format Filter */}
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-gray-400" />
                <select
                  value={filterFormat}
                  onChange={(e) => setFilterFormat(e.target.value)}
                  className="px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
                >
                  <option value="all">All Formats</option>
                  <option value="visual">Mind Maps</option>
                  <option value="quiz">Quizzes</option>
                  <option value="reports">Summaries</option>
                  <option value="infographic">Infographics</option>
                </select>
              </div>

              {/* View Toggle */}
              <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2.5 ${viewMode === 'grid' ? 'bg-purple-100 text-purple-600' : 'bg-white text-gray-400 hover:text-gray-600'}`}
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2.5 ${viewMode === 'list' ? 'bg-purple-100 text-purple-600' : 'bg-white text-gray-400 hover:text-gray-600'}`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Drag hint */}
          <AnimatePresence>
            {draggedItem && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-xl flex items-center gap-2 text-sm text-purple-700"
              >
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  📁
                </motion.div>
                <span>Drop on a folder to move "{draggedItem.title}"</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Folders + Files Section (Finder-style) - Only show when not inside a folder */}
          {!selectedFolderId && (folders.length > 0 || filteredResults.length > 0) && (
            <motion.div
              className="mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <h2 className="text-lg font-semibold text-gray-700 mb-4">Folders & Files</h2>
              <StaggerContainer className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                <AnimatePresence>
                  {/* Folders first */}
                  {folders.map((folder) => (
                    <StaggerItem key={`folder-${folder.id}`}>
                      <motion.div
                        layout
                        onClick={() => setSelectedFolderId(folder.id)}
                        onDragOver={handleDragOver}
                        onDragEnter={() => handleDragEnterFolder(folder.id)}
                        onDragLeave={handleDragLeaveFolder}
                        onDrop={(e) => handleDropOnFolder(e, folder.id)}
                        className={`group bg-white p-4 rounded-xl shadow-sm border transition-all duration-200 cursor-pointer relative ${dragOverFolder === folder.id
                          ? 'border-purple-500 bg-purple-50 scale-105 shadow-lg'
                          : 'border-gray-200 hover:shadow-md hover:border-purple-200'
                          }`}
                        whileHover={{ y: -4 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${dragOverFolder === folder.id ? 'bg-purple-100' : 'bg-blue-50'
                            }`}>
                            <Folder className={`w-6 h-6 transition-colors ${dragOverFolder === folder.id ? 'text-purple-600' : 'text-blue-600'
                              }`} />
                          </div>
                          <button
                            onClick={(e) => handleDeleteFolder(e, folder.id)}
                            className="p-1 text-gray-400 hover:text-red-700 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                            aria-label="Delete folder"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <h3 className="font-medium text-gray-900 truncate text-sm">{folder.name}</h3>
                        <p className="text-xs text-gray-500 mt-1">
                          {results.filter(r => r.folder_id === folder.id).length} items
                        </p>

                        {/* Drop indicator */}
                        {dragOverFolder === folder.id && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="absolute inset-0 bg-purple-500/10 rounded-xl border-2 border-dashed border-purple-500 flex items-center justify-center pointer-events-none"
                          >
                            <span className="text-xs font-medium text-purple-700">Drop here</span>
                          </motion.div>
                        )}
                      </motion.div>
                    </StaggerItem>
                  ))}
                  {/* Files (documents not in any folder) */}
                  {filteredResults.filter(r => !r.folder_id).map((result) => (
                    <StaggerItem key={`file-${result.id}`}>
                      <motion.div
                        layout
                        draggable
                        onDragStart={(e) => handleDragStart(e, result)}
                        onDragEnd={handleDragEnd}
                        onClick={() => handleViewResult(result)}
                        className={`group bg-white p-4 rounded-xl shadow-sm border border-gray-200 hover:shadow-md hover:border-purple-200 transition-all duration-200 cursor-pointer ${draggedItem?.id === result.id ? 'opacity-50' : ''}`}
                        whileHover={{ y: -4 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
                            <FileText className="w-6 h-6 text-purple-600" />
                          </div>
                          <button
                            onClick={(e) => handleDelete(result.id, e)}
                            className="p-1 text-gray-400 hover:text-red-700 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                            aria-label="Delete file"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <h3 className="font-medium text-gray-900 truncate text-sm">{result.title}</h3>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatDate(result.created_at || result.uploadedAt)}
                        </p>
                      </motion.div>
                    </StaggerItem>
                  ))}
                </AnimatePresence>
              </StaggerContainer>
            </motion.div>
          )}

          {/* Recently Accessed Section - Only show when not inside a folder */}
          {!selectedFolderId && recentlyAccessedResults.length > 0 && (
            <motion.div
              className="mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <h2 className="text-lg font-semibold text-gray-700 mb-4">Recently Accessed</h2>
              <StaggerContainer className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                <AnimatePresence>
                  {recentlyAccessedResults.map((result) => (
                    <StaggerItem key={result.id}>
                      <motion.div
                        layout
                        onClick={() => handleViewResult(result)}
                        className="group bg-white p-4 rounded-xl shadow-sm border border-gray-200 hover:shadow-md hover:border-purple-200 transition-all duration-200 cursor-pointer"
                        whileHover={{ y: -4 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center mb-3">
                          <FileText className="w-6 h-6 text-purple-600" />
                        </div>
                        <h3 className="font-medium text-gray-900 truncate text-sm">{result.title}</h3>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatDate(result.created_at || result.uploadedAt)}
                        </p>
                      </motion.div>
                    </StaggerItem>
                  ))}
                </AnimatePresence>
              </StaggerContainer>
            </motion.div>
          )}

          {/* Results count after filter */}
          {(searchTerm || filterFormat !== 'all') && (
            <p className="text-sm text-gray-500 mb-4">
              Showing {filteredResults.length} of {results.length} results
            </p>
          )}

          {/* Documents Section - Only show when inside a folder */}
          {selectedFolderId && (
          <div>
            <h2 className="text-lg font-semibold text-gray-700 mb-4">Documents</h2>

            {filteredResults.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-300">
                <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">
                  {searchTerm || filterFormat !== 'all'
                    ? 'No results match your search'
                    : selectedFolderId
                      ? 'No documents in this folder yet'
                      : 'No documents yet'}
                </p>
                <Link
                  to="/upload"
                  state={{ folderId: selectedFolderId }}
                  className="inline-flex items-center mt-4 text-purple-600 hover:text-purple-700 font-medium"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Upload a document
                </Link>
              </div>
            ) : viewMode === 'grid' ? (
              /* Grid View */
              <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence>
                  {filteredResults.map((result) => (
                    <StaggerItem key={result.id}>
                      <motion.div
                        layout
                        draggable={!selectedFolderId}
                        onDragStart={(e) => handleDragStart(e, result)}
                        onDragEnd={handleDragEnd}
                        className={`group bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer ${draggedItem?.id === result.id ? 'opacity-50' : ''
                          }`}
                        onClick={() => handleViewResult(result)}
                        whileHover={{ y: -4 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {/* Card Header with gradient */}
                        <div className="h-2 bg-gradient-to-r from-purple-500 via-blue-500 to-indigo-500"></div>

                        <div className="p-5">
                          {/* Title and Date */}
                          <div className="mb-4">
                            <h3 className="font-semibold text-gray-900 text-lg mb-1 line-clamp-2 group-hover:text-purple-600 transition-colors">
                              {result.title}
                            </h3>
                            <div className="flex items-center text-sm text-gray-500">
                              <Calendar className="w-4 h-4 mr-1.5" />
                              {formatDate(result.created_at || result.uploadedAt)}
                            </div>
                          </div>

                          {/* Format Badges */}
                          <div className="flex flex-wrap gap-2 mb-4">
                            {Object.keys(result.formats || {}).map((formatKey) => (
                              <span
                                key={formatKey}
                                className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium border ${getFormatBadgeColor(formatKey)}`}
                              >
                                {getFormatIcon(formatKey)}
                                <span className="ml-1.5">{getFormatLabel(formatKey)}</span>
                              </span>
                            ))}
                          </div>

                          {/* Preview thumbnails for infographics */}
                          {result.formats?.infographic?.data?.image_data && (
                            <div className="mb-4 rounded-lg overflow-hidden border border-gray-100">
                              <img
                                src={result.formats.infographic.data.image_data}
                                alt="Infographic preview"
                                className="w-full h-32 object-cover object-top"
                              />
                            </div>
                          )}

                          {/* Actions */}
                          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewResult(result);
                              }}
                              className="inline-flex items-center text-sm font-medium text-purple-600 hover:text-purple-700"
                            >
                              <Eye className="w-4 h-4 mr-1.5" />
                              View
                            </button>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={(e) => handleOpenMoveToFolder(e, result)}
                                className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Move to folder"
                              >
                                <FolderPlus className="w-4 h-4" />
                              </button>
                              <button
                                onClick={(e) => handleDelete(result.id, e)}
                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    </StaggerItem>
                  ))}
                </AnimatePresence>
              </StaggerContainer>
            ) : (
              /* List View */
              <motion.div
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Formats</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <AnimatePresence>
                      {filteredResults.map((result, index) => (
                        <motion.tr
                          key={result.id}
                          draggable={!selectedFolderId}
                          onDragStart={(e) => handleDragStart(e, result)}
                          onDragEnd={handleDragEnd}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          transition={{ duration: 0.2, delay: index * 0.05 }}
                          onClick={() => handleViewResult(result)}
                          className={`hover:bg-gray-50 transition-colors cursor-pointer ${draggedItem?.id === result.id ? 'opacity-50' : ''
                            }`}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                <FileText className="h-5 w-5 text-purple-600" />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{result.title}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex flex-wrap gap-1">
                              {Object.keys(result.formats || {}).map((formatKey) => (
                                <span
                                  key={formatKey}
                                  className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getFormatBadgeColor(formatKey)}`}
                                >
                                  {getFormatLabel(formatKey)}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">
                              {formatDate(result.created_at || result.uploadedAt)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={(e) => handleOpenMoveToFolder(e, result)}
                                className="text-blue-600 hover:text-blue-800 p-1"
                                title="Move to folder"
                              >
                                <FolderPlus className="w-4 h-4" />
                              </button>
                              <button
                                onClick={(e) => handleDelete(result.id, e)}
                                className="text-red-600 hover:text-red-800 p-1"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              </motion.div>
            )}
          </div>
          )}
        </div>
      </div>

      {/* New Folder Modal */}
      <AnimatePresence>
        {showNewFolderModal && (
          <>
            <motion.div
              className="fixed inset-0 bg-black bg-opacity-50 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowNewFolderModal(false)}
            />
            <motion.div
              className="fixed inset-0 flex items-center justify-center z-50 p-4"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold text-gray-900">Create New Folder</h3>
                  <button onClick={() => setShowNewFolderModal(false)} className="text-gray-400 hover:text-gray-600">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <form onSubmit={handleCreateFolder}>
                  <input
                    type="text"
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    placeholder="Folder name"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent mb-4"
                    autoFocus
                  />
                  <div className="flex justify-end gap-3">
                    <AnimatedButton
                      type="button"
                      onClick={() => setShowNewFolderModal(false)}
                      className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                    >
                      Cancel
                    </AnimatedButton>
                    <AnimatedButton
                      type="submit"
                      className="px-4 py-2.5 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors font-medium disabled:opacity-50"
                      disabled={!newFolderName.trim() || createFolderMutation.isPending}
                    >
                      {createFolderMutation.isPending ? 'Creating...' : 'Create Folder'}
                    </AnimatedButton>
                  </div>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Move to Folder Modal */}
      <AnimatePresence>
        {showMoveToFolderModal && (
          <>
            <motion.div
              className="fixed inset-0 bg-black bg-opacity-50 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setShowMoveToFolderModal(false);
                setItemToMove(null);
              }}
            />
            <motion.div
              className="fixed inset-0 flex items-center justify-center z-50 p-4"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
            >
              <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold text-gray-900">Move to Folder</h3>
                  <button
                    onClick={() => {
                      setShowMoveToFolderModal(false);
                      setItemToMove(null);
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Select a folder for "<span className="font-medium">{itemToMove?.title}</span>"
                </p>

                {/* Remove from folder option */}
                {itemToMove?.folder_id && (
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={(e) => {
                      handleRemoveFromFolder(e, itemToMove);
                      setShowMoveToFolderModal(false);
                      setItemToMove(null);
                    }}
                    className="w-full text-left p-4 mb-2 border border-gray-200 rounded-xl hover:border-red-300 hover:bg-red-50 transition-all duration-200 flex items-center gap-3"
                  >
                    <X className="w-5 h-5 text-red-500" />
                    <span className="text-red-600 font-medium">Remove from folder</span>
                  </motion.button>
                )}

                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {folders.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No folders available. Create one first!
                    </div>
                  ) : (
                    folders.map((folder, index) => (
                      <motion.button
                        key={folder.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => handleMoveToFolder(folder.id)}
                        disabled={folder.id === itemToMove?.folder_id || moveLessonMutation.isPending}
                        className={`w-full text-left p-4 border rounded-xl transition-all duration-200 flex items-center gap-3
                          ${folder.id === itemToMove?.folder_id
                            ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                            : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50'}`}
                      >
                        <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                          <Folder className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{folder.name}</div>
                          <div className="text-xs text-gray-500">
                            {results.filter(r => r.folder_id === folder.id).length} items
                          </div>
                        </div>
                        {folder.id === itemToMove?.folder_id && (
                          <span className="ml-auto text-xs text-gray-400">Current</span>
                        )}
                      </motion.button>
                    ))
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <AnimatedButton
                    onClick={() => {
                      setShowMoveToFolderModal(false);
                      setShowNewFolderModal(true);
                    }}
                    className="w-full px-4 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Create New Folder
                  </AnimatedButton>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Click outside to close folder menu */}
      {folderMenuOpen && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setFolderMenuOpen(null)}
        />
      )}
    </PageTransition>
  );
}
