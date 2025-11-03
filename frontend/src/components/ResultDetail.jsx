import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import MindMapViewer from './MindMapViewer';

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

const loadCachedResult = () => {
  if (typeof window === 'undefined') return null;
  const raw = window.sessionStorage.getItem(LAST_RESULT_STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (err) {
    console.warn('Unable to parse cached result payload', err);
    return null;
  }
};

const persistResult = (payload) => {
  if (typeof window === 'undefined' || !payload) return;
  try {
    window.sessionStorage.setItem(LAST_RESULT_STORAGE_KEY, JSON.stringify(payload));
  } catch (err) {
    console.warn('Unable to persist result payload', err);
  }
};

export default function ResultDetail() {
  const { id } = useParams();
  const location = useLocation();
  const viewerRef = useRef(null);

  const [result, setResult] = useState(() => {
    if (location.state) return location.state;
    return loadCachedResult();
  });
  const [bookmarked, setBookmarked] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(true);
  const [shareStatus, setShareStatus] = useState('');

  useEffect(() => {
    if (location.state) {
      setResult(location.state);
      persistResult(location.state);
    }
  }, [location.state]);

  const visualFormat = result?.formats?.visual;

  const relativeUploadTime = useMemo(
    () => formatRelativeTime(result?.uploadedAt || result?.uploadDate),
    [result?.uploadedAt, result?.uploadDate]
  );

  const absoluteUploadTime = useMemo(
    () => formatAbsoluteDate(result?.uploadedAt || result?.uploadDate),
    [result?.uploadedAt, result?.uploadDate]
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

  if (!result || !visualFormat) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">No generated mind map yet</h1>
          <p className="text-gray-600">
            Upload a document and generate a mind map to see it here.
          </p>
        </div>
      </div>
    );
  }

  const resultTitle = result?.title || 'Generated Mind Map';

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
                className={`p-2 rounded-lg transition-colors ${
                  bookmarked
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
            <div className="card">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">{visualFormat?.type || 'Mind Map'}</h2>
                  <p className="text-sm text-gray-600">
                    {visualFormat?.description || 'Explore concepts and relationships extracted from your upload.'}
                  </p>
                </div>
                <button
                  onClick={() => setIsPreviewOpen((prev) => !prev)}
                  className="text-sm font-semibold text-purple-600 hover:text-purple-700 transition"
                >
                  {isPreviewOpen ? 'Collapse' : 'Expand'}
                </button>
              </div>

              {visualFormat?.error && (
                <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {visualFormat.error}
                </div>
              )}

              {!visualFormat?.error && (
                <div className="mt-6">
                  {isPreviewOpen ? (
                    visualFormat?.data ? (
                      <>
                        <MindMapViewer ref={viewerRef} mindMapData={visualFormat.data} />
                        <div className="flex flex-wrap items-center gap-3 mt-4 text-sm text-gray-500">
                          <button
                            onClick={handleResetView}
                            className="text-purple-600 font-medium hover:text-purple-700"
                          >
                            Re-center view
                          </button>
                          <span>Need more space? Use fullscreen mode from the controls.</span>
                        </div>
                      </>
                    ) : (
                      <div className="bg-gray-50 border border-dashed border-gray-200 rounded-lg p-6 text-center text-gray-600">
                        Mind map is still processing. Check back shortly.
                      </div>
                    )
                  ) : (
                    <div className="bg-gray-50 border border-dashed border-gray-200 rounded-lg p-6 text-center text-gray-500">
                      Preview hidden. Select “Expand” to view the generated mind map.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6 lg:sticky lg:top-6">
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Quick Actions</h3>
              <div className="space-y-2">
                <button
                  onClick={handleDownloadMindMap}
                  className="w-full btn-secondary text-sm"
                >
                  Download Mind Map
                </button>
                <button
                  onClick={handleOpenFullscreen}
                  className="w-full btn-secondary text-sm"
                >
                  View Fullscreen
                </button>
              </div>
            </div>

            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Result ID:</span>
                  <span className="font-medium text-gray-900">{result?.id || id || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Uploaded:</span>
                  <span className="font-medium text-gray-900 text-right">{absoluteUploadTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">File Name:</span>
                  <span
                    className="font-medium text-gray-900 max-w-[200px] truncate text-right"
                    title={resultTitle}
                  >
                    {resultTitle}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
