import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Folder, FileText, Plus, MoreVertical, X } from 'lucide-react';
import apiService from '../services/apiService';
import { supabase } from '../supabaseConfig';

export default function LessonsPage({ user }) {
    const navigate = useNavigate();
    const [folders, setFolders] = useState([]);
    const [lessons, setLessons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showNewFolderModal, setShowNewFolderModal] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');
    const [selectedFolderId, setSelectedFolderId] = useState(null);

    useEffect(() => {
        if (user) {
            loadData(user.id);
        }
    }, [user]);

    const loadData = async (userId) => {
        try {
            setLoading(true);
            const [foldersData, lessonsData] = await Promise.all([
                apiService.getFolders(userId),
                apiService.getResults()
            ]);
            setFolders(foldersData);
            setLessons(lessonsData);
        } catch (error) {
            console.error('Failed to load data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateFolder = async (e) => {
        e.preventDefault();
        console.log('Creating folder...', { newFolderName, user });

        if (!newFolderName.trim()) {
            console.warn('Folder name is empty');
            return;
        }

        if (!user) {
            console.error('User is not logged in or user object is missing');
            alert('User information missing. Please try logging out and back in.');
            return;
        }

        try {
            console.log('Sending create request...');
            const newFolder = await apiService.createFolder(newFolderName, user.id);
            console.log('Folder created:', newFolder);
            setFolders([newFolder, ...folders]);
            setNewFolderName('');
            setShowNewFolderModal(false);
        } catch (error) {
            console.error('Failed to create folder:', error);
            alert(`Failed to create folder: ${error.message}`);
        }
    };

    const handleNewLesson = () => {
        navigate('/upload', { state: { folderId: selectedFolderId } });
    };

    const filteredLessons = selectedFolderId
        ? lessons.filter(l => l.folder_id === selectedFolderId)
        : lessons;

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">
                        {selectedFolderId
                            ? folders.find(f => f.id === selectedFolderId)?.name || 'My Lessons'
                            : 'My Lessons'}
                    </h1>
                    <div className="flex gap-3">
                        <button
                            onClick={() => setShowNewFolderModal(true)}
                            className="btn-secondary flex items-center gap-2 py-2 px-4 text-sm"
                        >
                            <Plus className="w-4 h-4" />
                            New Folder
                        </button>
                        <button
                            onClick={handleNewLesson}
                            className="btn-primary flex items-center gap-2 py-2 px-4 text-sm"
                        >
                            <Plus className="w-4 h-4" />
                            New Lesson
                        </button>
                    </div>
                </div>

                {/* Folders Grid */}
                {!selectedFolderId && (
                    <>
                        <h2 className="text-lg font-semibold text-gray-700 mb-4">Folders</h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-10">
                            {folders.map((folder) => (
                                <div
                                    key={folder.id}
                                    onClick={() => setSelectedFolderId(folder.id)}
                                    className="group bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 cursor-pointer"
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <Folder className={`w-10 h-10 ${folder.color || 'text-blue-600 bg-blue-50'} p-2 rounded-lg`} />
                                        <button className="text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <MoreVertical className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <h3 className="font-medium text-gray-900 truncate">{folder.name}</h3>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {lessons.filter(l => l.folder_id === folder.id).length} items
                                    </p>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {/* Back button if folder selected */}
                {selectedFolderId && (
                    <button
                        onClick={() => setSelectedFolderId(null)}
                        className="mb-6 text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
                    >
                        ← Back to all folders
                    </button>
                )}

                {/* Files Grid */}
                <h2 className="text-lg font-semibold text-gray-700 mb-4">
                    {selectedFolderId ? 'Lessons in this folder' : 'Recent Lessons'}
                </h2>

                {loading ? (
                    <div className="text-center py-10">Loading...</div>
                ) : filteredLessons.length === 0 ? (
                    <div className="text-center py-10 text-gray-500 bg-white rounded-xl border border-dashed border-gray-200">
                        No lessons found. Create one!
                    </div>
                ) : (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Created</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredLessons.map((lesson) => (
                                    <tr
                                        key={lesson.id}
                                        onClick={() => navigate(`/results/${lesson.id}`)}
                                        className="hover:bg-gray-50 transition-colors cursor-pointer"
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-lg flex items-center justify-center">
                                                    <FileText className="h-5 w-5 text-gray-500" />
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">{lesson.title}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-500">
                                                {new Date(lesson.created_at).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button className="text-gray-400 hover:text-gray-600">
                                                <MoreVertical className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* New Folder Modal */}
            {showNewFolderModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md">
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
                                placeholder="Folder Name"
                                className="input-field mb-4"
                                autoFocus
                            />
                            <div className="flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowNewFolderModal(false)}
                                    className="btn-secondary py-2 px-4"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn-primary py-2 px-4"
                                    disabled={!newFolderName.trim()}
                                >
                                    Create
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
