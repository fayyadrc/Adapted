import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Trophy, Compass, Plus } from 'lucide-react';

export default function HomePage({ user }) {
  const userName = user?.name || 'Student';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Greeting */}
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Hello, {userName}!
          </h1>
          <p className="text-lg text-gray-600">
            Ready to continue your learning journey?
          </p>
        </div>


        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Link
            to="/assessment"
            className="group bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-purple-100 transition-all duration-200 flex flex-col items-center justify-center gap-4"
          >
            <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center group-hover:bg-purple-100 transition-colors">
              <Trophy className="w-8 h-8 text-purple-600" />
            </div>
            <span className="font-bold text-gray-900 text-xl">My Scores</span>
          </Link>

          {/* My Lessons */}
          <Link
            to="/lessons"
            className="group bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-100 transition-all duration-200 flex flex-col items-center justify-center gap-4"
          >
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center group-hover:bg-blue-100 transition-colors">
              <BookOpen className="w-8 h-8 text-blue-600" />
            </div>
            <span className="font-bold text-gray-900 text-xl">My Lessons</span>
          </Link>

          {/* Explore */}
          <Link
            className="group bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-green-100 transition-all duration-200 flex flex-col items-center justify-center gap-4"
          >
            <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center group-hover:bg-green-100 transition-colors">
              <Compass className="w-8 h-8 text-green-600" />
            </div>
            <span className="font-bold text-gray-900 text-xl">Explore</span>
          </Link>

          {/* Placeholder / Empty */}
          <div className="bg-gray-50 p-8 rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-4">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center">
              <Plus className="w-8 h-8 text-gray-400" />
            </div>
            <span className="font-medium text-gray-400 text-lg">Coming Soon</span>
          </div>
        </div>
      </div>
    </div>
  );
}

