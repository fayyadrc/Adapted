import React from 'react';
import ReactMarkdown from 'react-markdown';
import { FileText, CheckCircle, Lightbulb, BookOpen, Target } from 'lucide-react';

const SummaryViewer = ({ summaryData }) => {
  if (!summaryData) {
    return (
      <div className="p-6">
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg flex items-center">
          <FileText className="w-5 h-5 mr-2" />
          No summary data available
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-lg p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {summaryData.title || 'Summary'}
        </h1>
        <div className="flex items-center text-sm text-emerald-700">
          <FileText className="w-4 h-4 mr-2" />
          <span>Comprehensive Summary Report</span>
        </div>
      </div>

      {/* Quick Summary */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <div className="flex items-center">
            <BookOpen className="w-5 h-5 text-gray-700 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">Overview</h2>
          </div>
        </div>
        <div className="p-6">
          <div className="prose prose-sm max-w-none text-gray-700">
            <ReactMarkdown>{summaryData.summary}</ReactMarkdown>
          </div>
        </div>
      </div>

      {/* Key Points */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="bg-blue-50 px-6 py-4 border-b border-blue-200">
          <div className="flex items-center">
            <CheckCircle className="w-5 h-5 text-blue-700 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">Key Points</h2>
          </div>
        </div>
        <div className="p-6">
          <ul className="space-y-3">
            {summaryData.key_points?.map((point, index) => (
              <li key={index} className="flex items-start">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mr-3 mt-0.5">
                  <span className="text-xs font-semibold text-blue-700">{index + 1}</span>
                </div>
                <span className="text-gray-700 flex-1">{point}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Detailed Explanation */}
      {summaryData.detailed_explanation && (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="bg-purple-50 px-6 py-4 border-b border-purple-200">
            <div className="flex items-center">
              <Target className="w-5 h-5 text-purple-700 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">Detailed Explanation</h2>
            </div>
          </div>
          <div className="p-6">
            <div className="prose prose-sm max-w-none text-gray-700">
              <ReactMarkdown>{summaryData.detailed_explanation}</ReactMarkdown>
            </div>
          </div>
        </div>
      )}

      {/* Example */}
      {summaryData.example && (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="bg-amber-50 px-6 py-4 border-b border-amber-200">
            <div className="flex items-center">
              <Lightbulb className="w-5 h-5 text-amber-700 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">Example</h2>
            </div>
          </div>
          <div className="p-6">
            <div className="prose prose-sm max-w-none text-gray-700 bg-amber-50/50 p-4 rounded-lg border border-amber-100">
              <ReactMarkdown>{summaryData.example}</ReactMarkdown>
            </div>
          </div>
        </div>
      )}

      {/* Conclusion */}
      {summaryData.conclusion && (
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-lg p-6">
          <h3 className="text-sm font-semibold text-emerald-900 mb-2">Key Takeaway</h3>
          <div className="prose prose-sm max-w-none text-gray-700">
            <ReactMarkdown>{summaryData.conclusion}</ReactMarkdown>
          </div>
        </div>
      )}

      {/* Error Display */}
      {summaryData.error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 text-sm">
            <strong>Error:</strong> {summaryData.error}
          </p>
        </div>
      )}
    </div>
  );
};

export default SummaryViewer;
