import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import MindMapViewer from './MindMapViewer';
import QuizViewer from './QuizViewer';
import SummaryViewer from './SummaryViewer';
import AudioPlayer from './AudioPlayer';
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
          <Link to="/results" className="inline-flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
            Back to Results
          </Link>
        </div>
      </div>
    );
  }

  const resultTitle = result?.title || 'Generated Content';
  const hasFormats = result?.formats && Object.keys(result.formats).length > 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
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
              <button
                onClick={handleBookmark}
                className={`p-2 rounded-lg transition-colors ${bookmarked
                  ? 'bg-purple-100 text-purple-600'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                title="Bookmark this result"
              >
                <svg className="w-5 h-5" fill={bookmarked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h6a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
              </button>
              <button
                onClick={handleShare}
                className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                title="Share this result"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C9.589 12.938 10 12.502 10 12c0-.502-.411-.938-1.316-1.342m0 2.684a3 3 0 110-2.684m9.032-6.674l-9.032 4.026m0 7.288l9.032-4.026M5.106 18.894l7.572-4.297m0-6.882l-7.572 4.297" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] gap-6 items-start">
          <div className="space-y-6">
            {!hasFormats && (
              <div className="card">
                <div className="text-center py-12">
                  <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No formats generated yet</h3>
                  <p className="text-gray-600 mb-4">
                    This result doesn't have any generated formats yet.
                  </p>
                  <Link to="/upload" className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                    Upload New Content
                  </Link>
                </div>
              </div>
            )}

            {/* Mind Map Format */}
            {result?.formats?.visual && (
              <div className="card">
                <div className="flex items-center justify-between gap-4 mb-4">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      {result.formats.visual.type || 'Mind Map'}
                    </h2>
                    <p className="text-sm text-gray-600">
                      {result.formats.visual.description || 'Visual representation of key concepts'}
                    </p>
                  </div>
                </div>

                {result.formats.visual.error ? (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    {result.formats.visual.error}
                  </div>
                ) : result.formats.visual.data ? (
                  <>
                    <MindMapViewer ref={viewerRef} mindMapData={result.formats.visual.data} />
                    <div className="flex flex-wrap items-center gap-3 mt-4 text-sm text-gray-500">
                      <button
                        onClick={handleResetView}
                        className="text-purple-600 font-medium hover:text-purple-700"
                      >
                        Re-center view
                      </button>
                      <span>•</span>
                      <button
                        onClick={handleOpenFullscreen}
                        className="text-purple-600 font-medium hover:text-purple-700"
                      >
                        Fullscreen
                      </button>
                      <span>•</span>
                      <button
                        onClick={handleDownloadMindMap}
                        className="text-purple-600 font-medium hover:text-purple-700"
                      >
                        Download
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="bg-gray-50 border border-dashed border-gray-200 rounded-lg p-6 text-center text-gray-600">
                    Mind map is still processing...
                  </div>
                )}
              </div>
            )}

            {/* Quiz Format */}
            {result?.formats?.quiz && (
              <div className="card">
                <div className="mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {result.formats.quiz.type || 'Interactive Quiz'}
                  </h2>
                  <p className="text-sm text-gray-600">
                    {result.formats.quiz.description || 'Test your understanding'}
                  </p>
                  {result.formats.quiz.questionCount && (
                    <p className="text-sm text-purple-600 font-medium mt-1">
                      {result.formats.quiz.questionCount} questions
                    </p>
                  )}
                </div>

                {result.formats.quiz.error ? (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    {result.formats.quiz.error}
                  </div>
                ) : result.formats.quiz.data ? (
                  <QuizViewer quizData={result.formats.quiz.data} />
                ) : (
                  <div className="bg-gray-50 border border-dashed border-gray-200 rounded-lg p-6 text-center text-gray-600">
                    Quiz is still processing...
                  </div>
                )}
              </div>
            )}

            {/* Summary/Report Format */}
            {result?.formats?.reports && (
              <div className="card">
                <div className="mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {result.formats.reports.type || 'Summary Report'}
                  </h2>
                  <p className="text-sm text-gray-600">
                    {result.formats.reports.description || 'Comprehensive summary'}
                  </p>
                </div>

                {result.formats.reports.error ? (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    {result.formats.reports.error}
                  </div>
                ) : result.formats.reports.data ? (
                  <SummaryViewer summaryData={result.formats.reports.data} />
                ) : (
                  <div className="bg-gray-50 border border-dashed border-gray-200 rounded-lg p-6 text-center text-gray-600">
                    Summary is still processing...
                  </div>
                )}
              </div>
            )}

            {/* Audio Format */}
            {result?.formats?.audio && (
              <div className="card">
                <div className="mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {result.formats.audio.type || 'Podcast Audio'}
                  </h2>
                  <p className="text-sm text-gray-600">
                    {result.formats.audio.description || 'Two-speaker podcast conversation'}
                  </p>
                  {result.formats.audio.duration && (
                    <p className="text-sm text-blue-600 font-medium mt-1">
                      Duration: {result.formats.audio.duration}
                    </p>
                  )}
                </div>

                {result.formats.audio.error ? (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    {result.formats.audio.error}
                  </div>
                ) : result.formats.audio.url ? (
                  <AudioPlayer 
                    audioUrl={result.formats.audio.url}
                    title={resultTitle}
                    duration={result.formats.audio.duration}
                    hostVoiceId={result.formats.audio.host_voice_id}
                    guestVoiceId={result.formats.audio.guest_voice_id}
                  />
                ) : (
                  <div className="bg-gray-50 border border-dashed border-gray-200 rounded-lg p-6 text-center text-gray-600">
                    Audio is still processing...
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="space-y-6 lg:sticky lg:top-6">
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Generated Formats</h3>
              {hasFormats ? (
                <div className="space-y-2">
                  {result.formats.visual && (
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                      <span className="text-gray-700">Mind Map</span>
                    </div>
                  )}
                  {result.formats.quiz && (
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      <span className="text-gray-700">Interactive Quiz</span>
                    </div>
                  )}
                  {result.formats.reports && (
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                      <span className="text-gray-700">Summary Report</span>
                    </div>
                  )}
                  {result.formats.audio && (
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      <span className="text-gray-700">Podcast Audio</span>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No formats available</p>
              )}
            </div>

            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between gap-4">
                  <span className="text-gray-600">Result ID:</span>
                  <span className="font-medium text-gray-900 text-right truncate" title={result?.id || id}>{result?.id || id || '—'}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-gray-600">Uploaded:</span>
                  <span className="font-medium text-gray-900 text-right">{absoluteUploadTime}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-gray-600">File Name:</span>
                  <span
                    className="font-medium text-gray-900 truncate text-right"
                    title={resultTitle}
                  >
                    {resultTitle}
                  </span>
                </div>
              </div>
            </div>

            <div className="card">
              <Link
                to="/results"
                className="w-full inline-flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
              >
                ← Back to All Results
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
