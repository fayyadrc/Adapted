import React from 'react';
import { Link } from 'react-router-dom';

export default function Assessment() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Learning Style Assessment</h1>
          <p className="text-gray-600">
            Discover your preferred learning style to personalize your experience
          </p>
        </div>

        {/* Coming Soon Card */}
        <div className="card max-w-2xl mx-auto">
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Coming Soon!</h2>
            <p className="text-gray-600 mb-6">
              Our cognitive assessment feature is currently in development. This will help us understand your unique learning preferences and provide even more personalized recommendations.
            </p>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 mb-6 text-left">
              <h3 className="font-semibold text-purple-900 mb-3">What to expect:</h3>
              <ul className="space-y-2 text-purple-800 text-sm">
                <li className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-purple-600 rounded-full"></span>
                  <span>Quick cognitive assessment based on learning science</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-purple-600 rounded-full"></span>
                  <span>Personalized learning style recommendations</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-purple-600 rounded-full"></span>
                  <span>Integration with CAT4 and other cognitive data</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-purple-600 rounded-full"></span>
                  <span>Automatic format recommendations for your uploads</span>
                </li>
              </ul>
            </div>

            <p className="text-gray-600 mb-6">
              In the meantime, you can manually select your preferred learning formats when uploading content.
            </p>

            <div className="flex gap-4 justify-center">
              <Link to="/upload" className="btn-primary">
                Upload Content
              </Link>
              <Link to="/dashboard" className="btn-secondary">
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Visual Learning</h3>
            <p className="text-sm text-gray-600">
              Learn through images, diagrams, and mind maps
            </p>
          </div>

          <div className="card text-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 15.464a5 5 0 010-7.072m2.828 2.828a7 7 0 010 9.9M5.586 15.464a5 5 0 001.414-3.464m-1.414-3.464a5 5 0 010-7.072m15.656 0a9 9 0 010 12.728m-5.656-5.656a3 3 0 010-4.242" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Auditory Learning</h3>
            <p className="text-sm text-gray-600">
              Learn through listening and discussion
            </p>
          </div>

          <div className="card text-center">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5.36 4.24l-.707-.707M5.64 5.64l.707.707" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Kinesthetic Learning</h3>
            <p className="text-sm text-gray-600">
              Learn through hands-on practice and quizzes
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}