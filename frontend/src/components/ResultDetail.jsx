import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { Brain, FileQuestion, FileText, Sparkles, Maximize2, Minimize2, X, Download } from 'lucide-react';
import MindMapViewer from './MindMapViewer';
import QuizViewer from './QuizViewer';
import SummaryViewer from './SummaryViewer';
import apiService from '../services/apiService';

const LAST_RESULT_STORAGE_KEY = 'adapted:last-result';

const formatRelativeTime = (iso) => {
  if (!iso) return 'just now';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return 'just now';

  const diffSeconds = Math.round((date.getTime() - Date.now()) / 1000);
  const divisions = [
    { amount: 60 * 60 * 24 * 365, unit: 'year' },
    { amount: 60 * 60 * 24 * 30, unit: 'month' },
    { amount: 60 * 60 * 24 * 7, unit: 'week' },
    { amount: 60 * 60 * 24, unit: 'day' },
    { amount: 60 * 60, unit: 'hour' },
    { amount: 60, unit: 'minute' },
    { amount: 1, unit: 'second' },
  ];

  if (typeof Intl !== 'undefined' && typeof Intl.RelativeTimeFormat === 'function') {
    const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
    for (const division of divisions) {
      if (Math.abs(diffSeconds) >= division.amount || division.unit === 'second') {
        const value = Math.round(diffSeconds / division.amount);
        return rtf.format(value, division.unit);
      }
    }
  }

  const absSeconds = Math.abs(diffSeconds);
  if (absSeconds < 60) return 'just now';
  if (absSeconds < 3600) return `${Math.round(absSeconds / 60)} minute(s) ago`;
  if (absSeconds < 86400) return `${Math.round(absSeconds / 3600)} hour(s) ago`;
  if (absSeconds < 604800) return `${Math.round(absSeconds / 86400)} day(s) ago`;
  return date.toLocaleDateString();
};

const formatAbsoluteDate = (iso) => {
  if (!iso) return 'Not available';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return 'Not available';
  return date.toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
};


export default function ResultDetail() {
  const { id } = useParams();
  const location = useLocation();
  const viewerRef = useRef(null);

  const [result, setResult] = useState(() => {
    if (location.state) return location.state;
    return null;
  });

  const [bookmarked, setBookmarked] = useState(false);
  const [shareStatus, setShareStatus] = useState('');
  const [loading, setLoading] = useState(false);

  // Modal states - must be declared at top level, before any conditional returns
  const [showMindMapModal, setShowMindMapModal] = useState(false);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [showInfographicModal, setShowInfographicModal] = useState(false);

  useEffect(() => {
    if (location.state) {
      setResult(location.state);
    } else if (!result && id) {
      // Fetch from API
      setLoading(true);
      apiService.getResult(id)
        .then(data => {
          setResult(data);
        })
        .catch(err => {
          console.error("Failed to fetch result:", err);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [location.state, id, result]);


  const relativeUploadTime = useMemo(
    () => formatRelativeTime(result?.created_at || result?.uploadedAt || result?.uploadDate),
    [result?.created_at, result?.uploadedAt, result?.uploadDate]
  );

  const absoluteUploadTime = useMemo(
    () => formatAbsoluteDate(result?.created_at || result?.uploadedAt || result?.uploadDate),
    [result?.created_at, result?.uploadedAt, result?.uploadDate]
  );

  const handleBookmark = () => {
    setBookmarked((prev) => !prev);
  };

  const handleDownloadMindMap = () => {
    viewerRef.current?.downloadMindMap?.();
  };

  const handleOpenFullscreen = () => {
    viewerRef.current?.openFullscreen?.();
  };

  const handleShare = async () => {
    const shareLink = typeof window !== 'undefined' ? window.location.href : '';
    try {
      if (typeof navigator !== 'undefined' && navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareLink);
        setShareStatus('Link copied!');
        setTimeout(() => setShareStatus(''), 2000);
      } else {
        throw new Error('Clipboard API not available');
      }
    } catch (error) {
      console.warn('Clipboard write failed', error);
      setShareStatus('Unable to copy link');
      setTimeout(() => setShareStatus(''), 2000);
    }
  };

  const handleResetView = () => {
    viewerRef.current?.resetView?.();
  };

  // Derived values
  const resultTitle = result?.title || 'Generated Content';
  const hasFormats = result?.formats && Object.keys(result.formats).length > 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading result...</p>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Result not found</h1>
          <p className="text-gray-600 mb-6">
            This result may have been deleted or doesn't exist.
          </p>
          <Link to="/library" className="inline-flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
            Back to Library
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mind Map Modal */}
      {showMindMapModal && result?.formats?.visual?.data && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full h-full max-w-7xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Mind Map: {resultTitle}</h2>
                <p className="text-sm text-gray-500">Interactive visualization of your content</p>
              </div>
              <button onClick={() => setShowMindMapModal(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <MindMapViewer ref={viewerRef} mindMapData={result.formats.visual.data} />
            </div>
          </div>
        </div>
      )}

      {/* Quiz Modal */}
      {showQuizModal && result?.formats?.quiz?.data && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full h-full max-w-4xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Quiz: {resultTitle}</h2>
                <p className="text-sm text-gray-500">Test your knowledge</p>
              </div>
              <button onClick={() => setShowQuizModal(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <QuizViewer quizData={result.formats.quiz.data} />
            </div>
          </div>
        </div>
      )}

      {/* Summary Modal */}
      {showSummaryModal && result?.formats?.reports?.data && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full h-full max-w-4xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Summary: {resultTitle}</h2>
                <p className="text-sm text-gray-500">Comprehensive summary report</p>
              </div>
              <button onClick={() => setShowSummaryModal(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <SummaryViewer summaryData={result.formats.reports.data} />
            </div>
          </div>
        </div>
      )}

      {/* Infographic Modal */}
      {showInfographicModal && result?.formats?.infographic?.data && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full h-full max-w-4xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Infographic: {resultTitle}</h2>
                <p className="text-sm text-gray-500">AI-generated visual summary</p>
              </div>
              <button onClick={() => setShowInfographicModal(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 flex justify-center bg-gray-50">
              <img
                src={result.formats.infographic.data.url || result.formats.infographic.data.image_data}
                alt="Infographic"
                className="max-w-full h-auto shadow-lg rounded-lg"
              />
            </div>
            <div className="p-4 border-t border-gray-200 flex justify-end gap-2">
              <a
                href={result.formats.infographic.data.url || result.formats.infographic.data.image_data}
                download="infographic.jpg"
                className="px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download
              </a>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">{resultTitle}</h1>
            <p className="text-sm text-gray-600">Uploaded {relativeUploadTime}</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            {shareStatus && (
              <span className="px-3 py-1 text-xs font-semibold text-purple-600 bg-purple-100 rounded-full">
                {shareStatus}
              </span>
            )}
            <div className="flex gap-2">
              <Link
                to="/library"
                className="px-4 py-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors text-sm font-medium"
              >
                ← Back
              </Link>
            </div>
          </div>
        </div>

        {!hasFormats ? (
          <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No formats generated yet</h3>
            <p className="text-gray-600 mb-4">This result doesn't have any generated formats yet.</p>
            <Link to="/upload" className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
              Upload New Content
            </Link>
          </div>
        ) : (
          <>
            {/* Details Section */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                <div className="flex flex-col">
                  <span className="text-gray-500 mb-1">Result ID</span>
                  <span className="font-medium text-gray-900 truncate" title={result?.id || id}>{result?.id || id || '—'}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-500 mb-1">Uploaded</span>
                  <span className="font-medium text-gray-900">{absoluteUploadTime}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-500 mb-1">Document</span>
                  <span className="font-medium text-gray-900 truncate" title={resultTitle}>{resultTitle}</span>
                </div>
              </div>
            </div>

            {/* Format Cards Grid - Similar to Upload.jsx */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Generated Content</h3>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                  {Object.keys(result.formats).length} format{Object.keys(result.formats).length !== 1 ? 's' : ''}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Mind Map Card */}
                {result?.formats?.visual?.data && (
                  <div
                    onClick={() => setShowMindMapModal(true)}
                    className="bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200 rounded-lg p-4 cursor-pointer hover:shadow-lg transition-all"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                          <Brain className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 text-sm">Mind Map</h4>
                          <p className="text-xs text-gray-600">Interactive view</p>
                        </div>
                      </div>
                      <Maximize2 className="w-4 h-4 text-purple-600" />
                    </div>
                  </div>
                )}

                {/* Quiz Card */}
                {result?.formats?.quiz?.data && (
                  <div
                    onClick={() => setShowQuizModal(true)}
                    className="bg-gradient-to-br from-cyan-50 to-cyan-100 border-2 border-cyan-200 rounded-lg p-4 cursor-pointer hover:shadow-lg transition-all"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center">
                          <FileQuestion className="w-5 h-5 text-cyan-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 text-sm">Quiz</h4>
                          <p className="text-xs text-gray-600">
                            {result.formats.quiz.data.questions?.length || 0} questions
                          </p>
                        </div>
                      </div>
                      <Maximize2 className="w-4 h-4 text-cyan-600" />
                    </div>
                  </div>
                )}

                {/* Summary Card */}
                {result?.formats?.reports?.data && (
                  <div
                    onClick={() => setShowSummaryModal(true)}
                    className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-2 border-emerald-200 rounded-lg p-4 cursor-pointer hover:shadow-lg transition-all"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                          <FileText className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 text-sm">Summary</h4>
                          <p className="text-xs text-gray-600">
                            {result.formats.reports.data.title || 'Report ready'}
                          </p>
                        </div>
                      </div>
                      <Maximize2 className="w-4 h-4 text-emerald-600" />
                    </div>
                  </div>
                )}

                {/* Infographic Card */}
                {result?.formats?.infographic?.data && (
                  <div
                    onClick={() => setShowInfographicModal(true)}
                    className="bg-gradient-to-br from-pink-50 to-pink-100 border-2 border-pink-200 rounded-lg p-4 cursor-pointer hover:shadow-lg transition-all"
                  >
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
                            <Sparkles className="w-5 h-5 text-pink-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900 text-sm">Infographic</h4>
                            <p className="text-xs text-gray-600">Visual summary</p>
                          </div>
                        </div>
                        <Maximize2 className="w-4 h-4 text-pink-600" />
                      </div>
                      {/* Preview Image */}
                      <div className="relative">
                        <img
                          src={result.formats.infographic.data.url || result.formats.infographic.data.image_data}
                          alt="Infographic Preview"
                          className="w-full h-24 object-cover rounded-md border border-pink-200"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>


          </>
        )}
      </div>
    </div>
  );
}
