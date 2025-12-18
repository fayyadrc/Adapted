import React from 'react';
import ReactMarkdown from 'react-markdown';
import { motion } from 'framer-motion';
import { FileText, CheckCircle, Lightbulb, BookOpen, Target } from 'lucide-react';

// Animation variants for staggered entry
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 15,
    },
  },
};

// Progress indicator component
const ProgressIndicator = ({ sections }) => {
  const completedSections = sections.filter(Boolean).length;
  const totalSections = sections.length;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Content Structure
        </span>
        <span className="text-xs font-medium text-emerald-600">
          {completedSections} sections
        </span>
      </div>
      <div className="flex gap-1">
        {sections.map((hasContent, index) => (
          <motion.div
            key={index}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.1 + index * 0.05 }}
            className={`flex-1 h-1.5 rounded-full ${
              hasContent
                ? 'bg-gradient-to-r from-emerald-400 to-teal-500'
                : 'bg-slate-200'
            }`}
          />
        ))}
      </div>
    </motion.div>
  );
};

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

  // Track which sections have content for progress indicator
  const sections = [
    !!summaryData.summary,
    !!summaryData.key_points?.length,
    !!summaryData.detailed_explanation,
    !!summaryData.example,
    !!summaryData.conclusion,
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="p-6 space-y-6 max-w-4xl mx-auto"
    >
      {/* Header with Glassmorphism */}
      <motion.div
        variants={itemVariants}
        className="relative overflow-hidden rounded-2xl"
      >
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-cyan-500/10" />
        {/* Glassmorphism layer */}
        <div className="absolute inset-0 backdrop-blur-xl bg-white/60" />
        
        <div className="relative p-8 border border-emerald-200/50 rounded-2xl">
          <h1 className="text-4xl font-black text-slate-900 mb-3 font-serif leading-tight">
            {summaryData.title || 'Summary'}
          </h1>
          <div className="flex items-center text-sm text-emerald-700">
            <FileText className="w-4 h-4 mr-2" />
            <span className="font-medium">Comprehensive Summary Report</span>
          </div>
        </div>
      </motion.div>

      {/* Progress Indicator */}
      <ProgressIndicator sections={sections} />

      {/* Quick Summary - Glassmorphism Card */}
      <motion.div
        variants={itemVariants}
        className="relative overflow-hidden rounded-2xl group"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/80 to-white/60 backdrop-blur-xl" />
        <div className="absolute inset-0 bg-slate-50/30" />
        
        <div className="relative border border-slate-200/50 rounded-2xl shadow-lg shadow-slate-100/50">
          <div className="bg-gradient-to-r from-slate-50/80 to-slate-100/80 backdrop-blur-sm px-6 py-4 border-b border-slate-200/50 rounded-t-2xl">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl flex items-center justify-center mr-3 shadow-sm">
                <BookOpen className="w-5 h-5 text-slate-700" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 font-serif">Overview</h2>
            </div>
          </div>
          <div className="p-6">
            <div className="prose prose-slate prose-lg max-w-none text-slate-700 leading-relaxed">
              <ReactMarkdown>{summaryData.summary}</ReactMarkdown>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Key Points - Modern Card Grid */}
      <motion.div
        variants={itemVariants}
        className="relative overflow-hidden rounded-2xl"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 backdrop-blur-xl" />
        <div className="absolute inset-0 bg-white/70" />
        
        <div className="relative border border-blue-200/50 rounded-2xl shadow-lg shadow-blue-100/30">
          <div className="bg-gradient-to-r from-blue-50/80 to-indigo-50/80 backdrop-blur-sm px-6 py-4 border-b border-blue-200/50 rounded-t-2xl">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center mr-3 shadow-sm">
                <CheckCircle className="w-5 h-5 text-blue-700" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 font-serif">Key Points</h2>
            </div>
          </div>
          <div className="p-6">
            <ul className="space-y-4">
              {summaryData.key_points?.map((point, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  className="flex items-start group"
                >
                  <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mr-4 mt-0.5 shadow-md shadow-blue-200 group-hover:scale-110 transition-transform">
                    <span className="text-sm font-bold text-white">{index + 1}</span>
                  </div>
                  <span className="text-slate-700 flex-1 text-lg leading-relaxed pt-1">{point}</span>
                </motion.li>
              ))}
            </ul>
          </div>
        </div>
      </motion.div>

      {/* Detailed Explanation */}
      {summaryData.detailed_explanation && (
        <motion.div
          variants={itemVariants}
          className="relative overflow-hidden rounded-2xl"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 to-pink-50/50 backdrop-blur-xl" />
          <div className="absolute inset-0 bg-white/70" />
          
          <div className="relative border border-purple-200/50 rounded-2xl shadow-lg shadow-purple-100/30">
            <div className="bg-gradient-to-r from-purple-50/80 to-pink-50/80 backdrop-blur-sm px-6 py-4 border-b border-purple-200/50 rounded-t-2xl">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center mr-3 shadow-sm">
                  <Target className="w-5 h-5 text-purple-700" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 font-serif">Detailed Explanation</h2>
              </div>
            </div>
            <div className="p-6">
              <div className="prose prose-slate prose-lg max-w-none text-slate-700 leading-relaxed">
                <ReactMarkdown>{summaryData.detailed_explanation}</ReactMarkdown>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Example - Highlighted Card */}
      {summaryData.example && (
        <motion.div
          variants={itemVariants}
          className="relative overflow-hidden rounded-2xl"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-amber-50/50 to-orange-50/50 backdrop-blur-xl" />
          <div className="absolute inset-0 bg-white/70" />
          
          <div className="relative border border-amber-200/50 rounded-2xl shadow-lg shadow-amber-100/30">
            <div className="bg-gradient-to-r from-amber-50/80 to-orange-50/80 backdrop-blur-sm px-6 py-4 border-b border-amber-200/50 rounded-t-2xl">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gradient-to-br from-amber-100 to-amber-200 rounded-xl flex items-center justify-center mr-3 shadow-sm">
                  <Lightbulb className="w-5 h-5 text-amber-700" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 font-serif">Example</h2>
              </div>
            </div>
            <div className="p-6">
              <div className="relative overflow-hidden rounded-xl">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-50 to-orange-50/50" />
                <div className="relative p-5 border border-amber-100 rounded-xl">
                  <div className="prose prose-slate prose-lg max-w-none text-slate-700 leading-relaxed">
                    <ReactMarkdown>{summaryData.example}</ReactMarkdown>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Conclusion - Gradient Card */}
      {summaryData.conclusion && (
        <motion.div
          variants={itemVariants}
          className="relative overflow-hidden rounded-2xl"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.2),_transparent)]" />
          
          <div className="relative p-8 text-white">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-100">
                Key Takeaway
              </h3>
            </div>
            <div className="prose prose-lg prose-invert max-w-none">
              <ReactMarkdown>{summaryData.conclusion}</ReactMarkdown>
            </div>
          </div>
        </motion.div>
      )}

      {/* Error Display */}
      {summaryData.error && (
        <motion.div
          variants={itemVariants}
          className="bg-red-50 border border-red-200 rounded-2xl p-4"
        >
          <p className="text-red-800 text-sm">
            <strong>Error:</strong> {summaryData.error}
          </p>
        </motion.div>
      )}

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="text-center pt-4"
      >
        <p className="text-xs text-slate-400">
          Generated by Adapted AI • Interactive Summary
        </p>
      </motion.div>
    </motion.div>
  );
};

export default SummaryViewer;
